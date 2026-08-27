/**
 * A small, dependency-free markdown renderer.
 *
 * It covers what a technical blog post actually needs — headings, lists,
 * fenced code, tables, blockquotes, links, images, emphasis — and nothing
 * more. Adding a markdown library would mean a lockfile, a supply chain,
 * and a slower CI for features you're unlikely to use.
 *
 * Everything is HTML-escaped before formatting is applied, so post content
 * can't inject markup by accident.
 */

const ESCAPES = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

export function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

/**
 * Only allow URL schemes that are safe to put in an href.
 * Anything else (javascript:, data:, vbscript:) collapses to "#".
 */
function safeUrl(url) {
  const trimmed = String(url).trim();
  if (/^(https?:\/\/|mailto:|tel:|#|\/|\.\/|\.\.\/)/i.test(trimmed)) return trimmed;
  if (/^[\w./-]+$/.test(trimmed)) return trimmed; // plain relative path
  return "#";
}

/**
 * Parse `---` delimited frontmatter into a plain object.
 * Supports `key: value` and `key: [a, b, c]`.
 */
export function parseFrontmatter(raw) {
  const text = raw.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!match) return { data: {}, body: text.trim() };

  const data = {};
  for (const line of match[1].split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const sep = line.indexOf(":");
    if (sep === -1) continue;

    const key = line.slice(0, sep).trim();
    let value = line.slice(sep + 1).trim();

    // Strip matching surrounding quotes
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length > 1) ||
      (value.startsWith("'") && value.endsWith("'") && value.length > 1)
    ) {
      value = value.slice(1, -1);
    }

    if (value.startsWith("[") && value.endsWith("]")) {
      data[key] = value
        .slice(1, -1)
        .split(",")
        .map((item) => item.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else if (value === "true" || value === "false") {
      data[key] = value === "true";
    } else {
      data[key] = value;
    }
  }

  return { data, body: text.slice(match[0].length).trim() };
}

/** Inline formatting: code, images, links, bold, italic. */
function inline(text) {
  let out = escapeHtml(text);

  // Protect inline code first so its contents aren't treated as markup.
  const codeSpans = [];
  out = out.replace(/`([^`]+)`/g, (_, code) => {
    codeSpans.push(code);
    return `\u0000CODE${codeSpans.length - 1}\u0000`;
  });

  // Images before links — the syntax only differs by a leading "!".
  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, alt, src, title) =>
      `<img src="${safeUrl(src)}" alt="${alt}" loading="lazy" decoding="async"${
        title ? ` title="${title}"` : ""
      }>`
  );

  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g,
    (_, label, href, title) => {
      const url = safeUrl(href);
      // External links open in a new tab, with the usual security rel.
      const external = /^https?:\/\//i.test(url);
      const attrs = external ? ' target="_blank" rel="noopener noreferrer"' : "";
      return `<a href="${url}"${title ? ` title="${title}"` : ""}${attrs}>${label}</a>`;
    }
  );

  out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  out = out.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, "$1<em>$2</em>");
  out = out.replace(/~~([^~]+)~~/g, "<del>$1</del>");

  // Restore protected code spans
  out = out.replace(/\u0000CODE(\d+)\u0000/g, (_, i) => `<code>${codeSpans[+i]}</code>`);

  return out;
}

function renderTableRow(line, cellTag) {
  const cells = line
    .trim()
    .replace(/^\||\|$/g, "")
    .split("|")
    .map((cell) => `<${cellTag}>${inline(cell.trim())}</${cellTag}>`)
    .join("");
  return `<tr>${cells}</tr>`;
}

/** True when a line continues the previous list item rather than starting
 *  a new block of its own. */
function isContinuation(line) {
  if (!line.trim()) return false;
  return !(
    /^\s*[-*+]\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    /^(#{1,6}\s|>|\`\`\`)/.test(line) ||
    /^\s*\|/.test(line) ||
    /^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)
  );
}

/** Render a markdown body to an HTML string. */
export function renderMarkdown(source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Fenced code block
    const fence = /^```\s*([\w+-]*)\s*$/.exec(line);
    if (fence) {
      const lang = fence[1];
      const body = [];
      i++;
      while (i < lines.length && !/^```\s*$/.test(lines[i])) {
        body.push(lines[i]);
        i++;
      }
      i++; // consume the closing fence
      const cls = lang ? ` class="language-${escapeHtml(lang)}"` : "";
      out.push(`<pre><code${cls}>${escapeHtml(body.join("\n"))}\n</code></pre>`);
      continue;
    }

    // Heading
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].trim();
      // Slug so headings can be deep-linked
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-");
      out.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})\s*$/.test(line)) {
      out.push("<hr>");
      i++;
      continue;
    }

    // Table — a header row followed by a |---|---| separator
    if (/^\|.*\|/.test(line) && i + 1 < lines.length && /^\|[\s:|-]+\|$/.test(lines[i + 1].trim())) {
      const head = renderTableRow(line, "th");
      i += 2;
      const body = [];
      while (i < lines.length && /^\|.*\|/.test(lines[i])) {
        body.push(renderTableRow(lines[i], "td"));
        i++;
      }
      out.push(
        `<div class="table-scroll"><table><thead>${head}</thead><tbody>${body.join(
          ""
        )}</tbody></table></div>`
      );
      continue;
    }

    // Blockquote
    if (/^>\s?/.test(line)) {
      const body = [];
      while (i < lines.length && /^>\s?/.test(lines[i])) {
        body.push(lines[i].replace(/^>\s?/, ""));
        i++;
      }
      out.push(`<blockquote>${renderMarkdown(body.join("\n"))}</blockquote>`);
      continue;
    }

    // Lists. Both kinds support "lazy continuation": a wrapped line that
    // belongs to the previous item rather than starting a new block. Without
    // this, a list item spanning two source lines silently splits into a
    // list plus a stray paragraph.
    const listMarker = /^\s*[-*+]\s+/.test(line)
      ? { re: /^\s*[-*+]\s+/, tag: "ul" }
      : /^\s*\d+[.)]\s+/.test(line)
      ? { re: /^\s*\d+[.)]\s+/, tag: "ol" }
      : null;

    if (listMarker) {
      const items = [];
      while (i < lines.length && listMarker.re.test(lines[i])) {
        let text = lines[i].replace(listMarker.re, "");
        i++;
        while (i < lines.length && isContinuation(lines[i])) {
          text += " " + lines[i].trim();
          i++;
        }
        items.push(`<li>${inline(text)}</li>`);
      }
      out.push(`<${listMarker.tag}>${items.join("")}</${listMarker.tag}>`);
      continue;
    }

    // Paragraph — gather until a blank line or the start of another block
    const para = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|>|\s*[-*+]\s|\s*\d+[.)]\s|```)/.test(lines[i]) &&
      !/^(\*{3,}|-{3,}|_{3,})\s*$/.test(lines[i])
    ) {
      para.push(lines[i].trim());
      i++;
    }
    if (para.length) out.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return out.join("\n");
}

/** Rough reading time, used in post metadata. */
export function readingTime(source) {
  const words = source.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** Strip markdown down to plain text — used for meta descriptions. */
export function toPlainText(source, limit = 160) {
  const text = source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (text.length <= limit) return text;
  return text.slice(0, limit - 1).replace(/\s+\S*$/, "") + "…";
}
