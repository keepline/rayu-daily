/* 极简 Markdown 渲染器：覆盖日记常用语法，输出安全的 HTML。 */
(function (global) {
  'use strict';

  function escapeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function inline(text) {
    var s = escapeHtml(text);
    s = s.replace(/`([^`]+)`/g, function (_, code) {
      return '<code>' + code + '</code>';
    });
    s = s.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (_, alt, src) {
      return src ? '<img src="' + src + '" alt="' + alt + '">' : _;
    });
    s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (_, label, href) {
      if (!href) return _;
      var safe = /^(https?:\/\/|\/|#)/.test(href) ? href : '#';
      return '<a href="' + safe + '" target="_blank" rel="noopener noreferrer">' + label + '</a>';
    });
    s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
    s = s.replace(/~~([^~]+)~~/g, '<del>$1</del>');
    return s;
  }

  function renderMarkdown(source) {
    var lines = String(source).replace(/\r\n/g, '\n').split('\n');
    var html = [];
    var i = 0;

    while (i < lines.length) {
      var line = lines[i];

      if (/^```/.test(line)) {
        var lang = line.slice(3).trim();
        var buf = [];
        i++;
        while (i < lines.length && !/^```/.test(lines[i])) {
          buf.push(lines[i]);
          i++;
        }
        i++;
        var code = escapeHtml(buf.join('\n'));
        html.push('<pre><code' + (lang ? ' class="lang-' + lang + '"' : '') + '>' + code + '</code></pre>');
        continue;
      }

      var heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        html.push('<h' + heading[1].length + '>' + inline(heading[2]) + '</h' + heading[1].length + '>');
        i++;
        continue;
      }

      if (/^\s*(\*\s*){3,}$/.test(line) || /^\s*(-\s*){3,}$/.test(line)) {
        html.push('<hr>');
        i++;
        continue;
      }

      if (/^\s*>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^\s*>\s?/.test(lines[i])) {
          quote.push(lines[i].replace(/^\s*>\s?/, ''));
          i++;
        }
        html.push('<blockquote>' + renderMarkdown(quote.join('\n')) + '</blockquote>');
        continue;
      }

      if (/^\s*[-*+]\s+/.test(line)) {
        var ul = [];
        while (i < lines.length && /^\s*[-*+]\s+/.test(lines[i])) {
          var item = lines[i].replace(/^\s*[-*+]\s+/, '');
          var task = item.match(/^\[([ xX])\]\s+(.*)$/);
          if (task) {
            var checked = task[1] !== ' ' ? ' checked' : '';
            ul.push('<li class="task"><input type="checkbox" disabled' + checked + '> ' + inline(task[2]) + '</li>');
          } else {
            ul.push('<li>' + inline(item) + '</li>');
          }
          i++;
        }
        html.push('<ul>' + ul.join('') + '</ul>');
        continue;
      }

      if (/^\s*\d+[.)]\s+/.test(line)) {
        var ol = [];
        while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) {
          ol.push('<li>' + inline(lines[i].replace(/^\s*\d+[.)]\s+/, '')) + '</li>');
          i++;
        }
        html.push('<ol>' + ol.join('') + '</ol>');
        continue;
      }

      if (!line.trim()) {
        i++;
        continue;
      }

      var para = [];
      while (i < lines.length && lines[i].trim() &&
             !/^(#{1,6}\s|```|\s*>|\s*[-*+]\s|\s*\d+[.)]\s)/.test(lines[i])) {
        para.push(lines[i]);
        i++;
      }
      html.push('<p>' + para.map(inline).join('<br>') + '</p>');
    }

    return html.join('\n');
  }

  global.MiniMarkdown = { render: renderMarkdown, escapeHtml: escapeHtml };
})(window);
