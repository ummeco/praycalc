// PrayCalc embeddable widget loader
// Usage: <script src="https://praycalc.com/embed/praycalc.js" data-theme="light" data-size="medium"></script>
(function() {
  'use strict';
  var script = document.currentScript || document.querySelector('script[src*="praycalc.js"]');
  if (!script) return;

  var theme = script.getAttribute('data-theme') || 'light';
  var size = script.getAttribute('data-size') || 'medium';

  var sizes = { small: [240, 180], medium: [360, 280], large: [480, 380] };
  var dims = sizes[size] || sizes.medium;

  var iframe = document.createElement('iframe');
  iframe.src = 'https://praycalc.com/embed?theme=' + theme + '&size=' + size;
  iframe.width = dims[0];
  iframe.height = dims[1];
  iframe.frameBorder = '0';
  iframe.style.border = 'none';
  iframe.style.borderRadius = '12px';
  iframe.title = 'PrayCalc Prayer Times Widget';

  script.parentNode.insertBefore(iframe, script.nextSibling);
})();
