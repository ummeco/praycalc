// Widget configuration page — where masjids go to get embed code
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Embed PrayCalc Prayer Times Widget | PrayCalc',
  description: 'Add a free prayer times widget to your website. Simple iframe or JavaScript embed.',
};

export default function WidgetPage() {
  const embedCode = `<script src="https://praycalc.com/embed/praycalc.js" data-theme="light" data-size="medium"></script>`;
  const iframeCode = `<iframe src="https://praycalc.com/embed?theme=light&size=medium" width="360" height="280" frameborder="0"></iframe>`;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-green-900 mb-2">Prayer Times Widget</h1>
      <p className="text-gray-600 mb-8">Add accurate prayer times to any website. Free forever.</p>

      {/* Preview */}
      <div className="border border-green-200 rounded-2xl p-6 mb-8 bg-green-50">
        <h2 className="font-semibold text-green-900 mb-4">Preview</h2>
        <iframe src="/embed?theme=light&size=medium" width="360" height="280" className="border-0 rounded-xl shadow" />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          { size: 'small', desc: '240x180px — minimal' },
          { size: 'medium', desc: '360x280px — standard' },
          { size: 'large', desc: '480x380px — detailed' },
        ].map(({ size, desc }) => (
          <div key={size} className="border rounded-xl p-4">
            <p className="font-medium capitalize">{size}</p>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
        {[
          { theme: 'light', desc: 'White background' },
          { theme: 'dark', desc: 'Dark green background' },
          { theme: 'auto', desc: 'Matches user preference' },
        ].map(({ theme, desc }) => (
          <div key={theme} className="border rounded-xl p-4">
            <p className="font-medium capitalize">{theme}</p>
            <p className="text-sm text-gray-500">{desc}</p>
          </div>
        ))}
      </div>

      {/* Embed code */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">JavaScript Embed (Recommended)</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto">{embedCode}</pre>
        </div>
        <div>
          <h3 className="font-semibold mb-2">iframe Embed</h3>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-xl text-sm overflow-x-auto">{iframeCode}</pre>
        </div>
      </div>
    </main>
  );
}
