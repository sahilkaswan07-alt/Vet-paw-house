/* Paw House — shared light / dark theme (loaded by home.html and petbox.html).

   • Light mode is the default.
   • A small "🌙 Dark mode" / "☀️ Light mode" button (bottom-left) lets the owner switch.
   • The choice is remembered in this browser (localStorage key "pawhouse_theme") and is
     shared by every page that loads this file, so home and each pet box always match.
   • It works by setting <html data-theme="light|dark">; the CSS files do the actual styling.

   Put   <script src="theme.js"></script>   in the <head> of each page (after the CSS link). */
(function () {
  var KEY = 'pawhouse_theme';

  function read() {
    try { return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  }
  function apply(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  apply(read()); // runs while <head> is parsed, so the page never flashes the wrong theme

  var btn = null;
  function isDark() { return document.documentElement.getAttribute('data-theme') === 'dark'; }
  function refresh() {
    if (!btn) return;
    btn.textContent = isDark() ? '☀️ Light mode' : '🌙 Dark mode';
    btn.setAttribute('aria-label', isDark() ? 'Switch to light mode' : 'Switch to dark mode');
  }
  function set(theme) {
    apply(theme);
    try { localStorage.setItem(KEY, theme); } catch (e) {}
    refresh();
  }

  function build() {
    var css = document.createElement('style');
    css.textContent =
      '.theme-toggle{position:fixed;left:18px;bottom:18px;z-index:100;cursor:pointer;' +
      'font:600 12px "Inter",sans-serif;letter-spacing:.04em;white-space:nowrap;' +
      'padding:.6rem 1rem;border-radius:40px;background:#ffffff;color:#1b1a22;' +
      'border:1.5px solid rgba(173,89,11,.45);box-shadow:0 4px 14px rgba(80,55,20,.18);' +
      'transition:transform .15s ease,filter .15s ease}' +
      '.theme-toggle:hover{transform:translateY(-2px);filter:brightness(.97)}' +
      '.theme-toggle:active{transform:scale(.96)}' +
      'html[data-theme="dark"] .theme-toggle{background:#1b1e27;color:#e8e2d5;' +
      'border-color:rgba(244,162,77,.45);box-shadow:0 4px 14px rgba(0,0,0,.4)}';
    document.head.appendChild(css);

    btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'theme-toggle';
    btn.addEventListener('click', function () { set(isDark() ? 'light' : 'dark'); });
    document.body.appendChild(btn);
    refresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();

  // keep other open tabs in sync
  window.addEventListener('storage', function (e) {
    if (e.key === KEY) { apply(read()); refresh(); }
  });
})();
