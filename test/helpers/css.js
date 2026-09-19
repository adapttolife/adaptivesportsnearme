// Formatting-independent CSS source assertions; values/selectors remain checked.
export function compactCss(css) {
  return String(css).replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ').replace(/\s*([{}:;,>])\s*/g, '$1')
    .replace(/@media\s+\(/g, '@media(').replace(/\s*\/\s*/g, '/').replace(/"([^"]*)"/g, "'$1'").replace(/\(\s*/g, '(').replace(/\s*\)/g, ')')
    .replace(/(^|[^\w.])0\.(\d+)/g, '$1.$2').trim();
}
export function cssIncludes(css, expected) { return compactCss(css).includes(compactCss(expected)); }
