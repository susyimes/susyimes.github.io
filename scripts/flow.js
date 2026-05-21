(function () {
  const target = document.getElementById('flowDocument');
  if (!target) return;

  const markdownPath = './data/svmes-flow.md';

  const escapeHtml = (value) => value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const renderInline = (value) => escapeHtml(value)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  const isDivider = (line) => /^-{3,}\s*$/.test(line.trim());
  const isHeading = (line) => /^(#{1,6})\s+/.test(line);
  const isUnorderedItem = (line) => /^\s*-\s+/.test(line);
  const isOrderedItem = (line) => /^\s*\d+\.\s+/.test(line);
  const isTableDivider = (line) => {
    const trimmed = line.trim();
    return /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(trimmed);
  };
  const isTableStart = (lines, index) => (
    lines[index]
    && lines[index].includes('|')
    && lines[index + 1]
    && isTableDivider(lines[index + 1])
  );

  const splitTableRow = (line) => line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());

  const renderTable = (lines, startIndex) => {
    const header = splitTableRow(lines[startIndex]);
    const rows = [];
    let index = startIndex + 2;

    while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
      rows.push(splitTableRow(lines[index]));
      index += 1;
    }

    const headHtml = header.map((cell) => `<th>${renderInline(cell)}</th>`).join('');
    const bodyHtml = rows.map((row) => (
      `<tr>${row.map((cell) => `<td>${renderInline(cell)}</td>`).join('')}</tr>`
    )).join('');

    return {
      html: `<div class="flow-table-wrap"><table><thead><tr>${headHtml}</tr></thead><tbody>${bodyHtml}</tbody></table></div>`,
      nextIndex: index,
    };
  };

  const renderList = (lines, startIndex, ordered) => {
    const items = [];
    let index = startIndex;
    const predicate = ordered ? isOrderedItem : isUnorderedItem;
    const itemPattern = ordered ? /^\s*\d+\.\s+/ : /^\s*-\s+/;

    while (index < lines.length && predicate(lines[index])) {
      items.push(lines[index].replace(itemPattern, ''));
      index += 1;
    }

    const tag = ordered ? 'ol' : 'ul';
    return {
      html: `<${tag}>${items.map((item) => `<li>${renderInline(item)}</li>`).join('')}</${tag}>`,
      nextIndex: index,
    };
  };

  const renderMarkdown = (markdown) => {
    const lines = markdown.replace(/\r\n/g, '\n').split('\n');
    const html = [];
    let index = 0;

    while (index < lines.length) {
      const line = lines[index];
      const trimmed = line.trim();

      if (!trimmed) {
        index += 1;
        continue;
      }

      if (trimmed.startsWith('```')) {
        const language = trimmed.replace(/^```/, '').trim();
        const codeLines = [];
        index += 1;

        while (index < lines.length && !lines[index].trim().startsWith('```')) {
          codeLines.push(lines[index]);
          index += 1;
        }

        if (index < lines.length) index += 1;
        html.push(`<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        continue;
      }

      if (isTableStart(lines, index)) {
        const table = renderTable(lines, index);
        html.push(table.html);
        index = table.nextIndex;
        continue;
      }

      if (isHeading(line)) {
        const match = line.match(/^(#{1,6})\s+(.*)$/);
        const level = Math.min(match[1].length + 1, 6);
        html.push(`<h${level}>${renderInline(match[2])}</h${level}>`);
        index += 1;
        continue;
      }

      if (isDivider(line)) {
        html.push('<hr />');
        index += 1;
        continue;
      }

      if (isUnorderedItem(line)) {
        const list = renderList(lines, index, false);
        html.push(list.html);
        index = list.nextIndex;
        continue;
      }

      if (isOrderedItem(line)) {
        const list = renderList(lines, index, true);
        html.push(list.html);
        index = list.nextIndex;
        continue;
      }

      const paragraph = [];
      while (
        index < lines.length
        && lines[index].trim()
        && !lines[index].trim().startsWith('```')
        && !isHeading(lines[index])
        && !isDivider(lines[index])
        && !isUnorderedItem(lines[index])
        && !isOrderedItem(lines[index])
        && !isTableStart(lines, index)
      ) {
        paragraph.push(lines[index].trim());
        index += 1;
      }

      html.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
    }

    return html.join('\n');
  };

  fetch(markdownPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Unable to load ${markdownPath}`);
      }
      return response.text();
    })
    .then((markdown) => {
      target.innerHTML = renderMarkdown(markdown);
    })
    .catch(() => {
      target.innerHTML = '<p class="flow-loading">SVMES_FLOW.md 载入失败，请稍后刷新。</p>';
    });
}());
