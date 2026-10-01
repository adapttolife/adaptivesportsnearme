// Render Lucide HTML tags on initial load and in dynamically inserted UI.
// The complete, pinned library is local: adding an icon needs no build step.
(() => {
  const selector = 'i[data-lucide]';
  function render(root) {
    const placeholders = root.matches?.(selector) ? [root] : [];
    placeholders.push(...root.querySelectorAll(selector));
    for (const placeholder of placeholders) {
      const name = placeholder.getAttribute('data-lucide');
      const key = name.replace(/(^|-)(\w)/g, (_, separator, letter) => letter.toUpperCase());
      const icon = lucide.icons[key];
      if (!icon) {
        console.warn(`Unknown Lucide icon: ${name}`);
        continue;
      }
      const attrs = Object.fromEntries(Array.from(placeholder.attributes, attr => [attr.name, attr.value]));
      attrs.class = `lucide lucide-${name} ${attrs.class || ''}`.trim();
      if (!Object.keys(attrs).some(name => name.startsWith('aria-'))) attrs['aria-hidden'] = 'true';
      attrs.focusable = 'false';
      placeholder.replaceWith(lucide.createElement(icon, attrs));
    }
  }
  render(document);
  new MutationObserver(records => {
    for (const record of records) {
      if (record.type === 'attributes') render(record.target);
      else for (const node of record.addedNodes) {
        if (node.nodeType === 1 && node.tagName.toLowerCase() !== 'svg') render(node);
      }
    }
  }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-lucide'] });
})();
