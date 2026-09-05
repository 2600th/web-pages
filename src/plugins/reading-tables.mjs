/** Keep Markdown comparisons semantic and keyboard-scrollable before hydration. */
export default function readingTables({ fileURL }) {
  if (!/\/content\/(notes|work)\//.test(fileURL?.pathname ?? '')) return;
  let section = 'Article comparison';
  return {
    name: 'reading-tables',
    element: {
      filter: ['h2', 'table', 'th'],
      visit(node, context) {
        if (node.tagName === 'h2') section = context.textContent(node);
        if (node.tagName === 'th' && !node.properties?.scope) context.setProperty(node, 'scope', 'col');
        const parentClasses = context.parent(node)?.properties?.className;
        if (node.tagName === 'table' && !parentClasses?.includes('table-scroll')) context.wrapNode(node, {
          type: 'element', tagName: 'div',
          properties: { className: ['table-scroll'], role: 'region', tabIndex: 0, ariaLabel: `${section} — comparison table` },
          children: [],
        });
      },
    },
  };
}
