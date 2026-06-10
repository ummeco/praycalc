// ignore: avoid_web_libraries_in_flutter
import 'dart:js_interop';
// ignore: avoid_web_libraries_in_flutter
import 'dart:ui_web' as ui_web;

import 'package:flutter/material.dart';
// ignore: avoid_web_libraries_in_flutter
import 'package:web/web.dart' as web;

/// Registers a YouTube embed iframe as a Flutter platform view.
///
/// Uses a direct iframe — no blob wrapper — so YouTube's CSP is not violated.
/// [embedUrl] must already include autoplay/mute/controls query params.
/// [viewId]   must be unique per stream+version (use stream id + version suffix).
Widget buildYouTubeIframe(String embedUrl, String viewId) {
  ui_web.platformViewRegistry.registerViewFactory(viewId, (_) {
    return (web.document.createElement('iframe') as web.HTMLIFrameElement)
      ..src = embedUrl
      ..style.width = '100%'
      ..style.height = '100%'
      ..style.border = 'none'
      ..style.background = '#000'
      ..setAttribute(
          'allow', 'autoplay; encrypted-media; picture-in-picture')
      ..setAttribute('allowfullscreen', 'true');
  });
  return HtmlElementView(viewType: viewId);
}

/// Registers an HLS video player as a Flutter platform view.
///
/// Uses a self-contained iframe with HLS.js loaded from CDN so the stream
/// plays in both desktop Chrome (no native HLS) and Android TV Chrome (native HLS).
/// [hlsUrl]  must be a valid .m3u8 HLS stream URL.
/// [viewId]  must be unique per stream+version (use stream id + version suffix).
/// [muted]   controls initial mute state (true required for autoplay).
Widget buildHlsVideoPlayer(String hlsUrl, String viewId, {bool muted = true}) {
  final mutedAttr = muted ? 'muted' : '';
  final autoMuteLine = muted ? '' : "v.muted=false;";
  final html = """<!DOCTYPE html>
<html><head>
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>*{margin:0;padding:0;box-sizing:border-box}body{background:#000;overflow:hidden}
video{width:100vw;height:100vh;object-fit:cover;background:#000}</style>
</head><body>
<video id="v" autoplay $mutedAttr playsinline></video>
<script src="https://cdn.jsdelivr.net/npm/hls.js@1.5.13/dist/hls.min.js"></script>
<script>
var v=document.getElementById('v');
$autoMuteLine
if(typeof Hls!=='undefined'&&Hls.isSupported()){
  var hls=new Hls({enableWorker:false,lowLatencyMode:true});
  hls.loadSource('${hlsUrl.replaceAll("'", "\\'")}');
  hls.attachMedia(v);
  hls.on(Hls.Events.MANIFEST_PARSED,function(){v.play().catch(function(){})});
  hls.on(Hls.Events.ERROR,function(e,d){if(d.fatal){hls.destroy();v.src='${hlsUrl.replaceAll("'", "\\'")}';v.play().catch(function(){});}});
}else if(v.canPlayType('application/vnd.apple.mpegurl')){
  v.src='${hlsUrl.replaceAll("'", "\\'")}';
  v.addEventListener('loadedmetadata',function(){v.play().catch(function(){})});
}
</script>
</body></html>""";

  ui_web.platformViewRegistry.registerViewFactory(viewId, (_) {
    return (web.document.createElement('iframe') as web.HTMLIFrameElement)
      ..srcdoc = html.toJS
      ..style.width = '100%'
      ..style.height = '100%'
      ..style.border = 'none'
      ..style.background = '#000'
      ..setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture')
      ..setAttribute('allowfullscreen', 'true');
  });
  return HtmlElementView(viewType: viewId);
}
