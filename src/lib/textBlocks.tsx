import { Fragment } from "react";

export type Block =
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "list"; items: string[]; ordered: boolean }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | { kind: "kv"; rows: Array<{ key: string; value: string }> }
  | { kind: "paragraph"; lines: string[] };

function normalizeText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) return content.filter((x) => typeof x === "string").join("\n");
  if (content == null) return "";
  return String(content);
}

function uppercaseRatio(text: string) {
  const letters = text.match(/[A-Za-z]/g) ?? [];
  if (letters.length === 0) return 0;
  const upper = letters.filter((ch) => ch === ch.toUpperCase()).length;
  return upper / letters.length;
}

function looksLikeHeading(text: string) {
  if (text.length > 120) return false;
  if (/[.?!]$/.test(text)) return false;
  return uppercaseRatio(text) > 0.75;
}

function splitTableRow(line: string) {
  const parts = line
    .split("|")
    .map((cell) => cell.trim())
    .filter((cell) => cell.length > 0);
  return parts;
}

function isKeyValueLine(line: string) {
  return /^([^:]{1,60}):\s+(.+)$/.test(line);
}

function parseInline(text: string): Array<string | { bold: string } | { code: string }> {
  const out: Array<string | { bold: string } | { code: string }> = [];
  let i = 0;
  while (i < text.length) {
    if (text.startsWith("**", i)) {
      const end = text.indexOf("**", i + 2);
      if (end !== -1) {
        out.push({ bold: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }
    if (text.startsWith("`", i)) {
      const end = text.indexOf("`", i + 1);
      if (end !== -1) {
        out.push({ code: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }
    out.push(text[i]);
    i += 1;
  }
  return out;
}

function renderInline(text: string) {
  const tokens = parseInline(text);
  return tokens.map((t, idx) => {
    if (typeof t === "string") return <Fragment key={idx}>{t}</Fragment>;
    if ("bold" in t) return <strong key={idx}>{t.bold}</strong>;
    return (
      <code key={idx} className="rounded bg-black/5 px-1 py-0.5 dark:bg-white/10">
        {t.code}
      </code>
    );
  });
}

export function parseBlocks(content: unknown): Block[] {
  if (Array.isArray(content)) {
    const items = content.filter((x): x is string => typeof x === "string").map((s) => s.trim()).filter(Boolean);
    if (items.length) return [{ kind: "list", items, ordered: false }];
  }

  const text = normalizeText(content);
  const chunks = text
    .split(/\n{2,}/g)
    .map((chunk) => chunk.trim())
    .filter(Boolean);

  return chunks.map((chunk) => {
    const lines = chunk
      .split(/\n/g)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 1 && looksLikeHeading(lines[0])) {
      const heading = lines[0];
      if (heading.length <= 32) {
        return { kind: "subheading", text: heading };
      }
      return { kind: "heading", text: heading };
    }

    if (lines.length >= 2) {
      const ordered = lines.every((line) => /^\d+[.)]\s+/.test(line));
      const unordered = lines.every((line) => /^[-*•]\s+/.test(line));
      if (ordered || unordered) {
        const items = lines.map((line) =>
          line.replace(/^\d+[.)]\s+/, "").replace(/^[-*•]\s+/, ""),
        );
        return { kind: "list", items, ordered };
      }
    }

    if (lines.length >= 2 && lines.every((line) => line.includes("|"))) {
      const rows = lines.map(splitTableRow);
      const width = rows[0].length;
      if (width >= 2 && rows.every((r) => r.length === width)) {
        return { kind: "table", headers: rows[0], rows: rows.slice(1) };
      }
    }

    if (lines.length >= 2 && lines.every(isKeyValueLine)) {
      const rows = lines.map((line) => {
        const match = line.match(/^([^:]{1,60}):\s+(.+)$/);
        return { key: match?.[1].trim() ?? line, value: match?.[2].trim() ?? "" };
      });
      return { kind: "kv", rows };
    }

    return { kind: "paragraph", lines };
  });
}

export function renderBlocks(blocks: Block[]) {
  return blocks.map((block, idx) => {
    if (block.kind === "heading") {
      return <h2 key={idx}>{block.text}</h2>;
    }
    if (block.kind === "subheading") {
      return <h3 key={idx}>{block.text}</h3>;
    }
    if (block.kind === "list") {
      const ListTag = block.ordered ? "ol" : "ul";
      return (
        <ListTag key={idx}>
          {block.items.map((item, itemIdx) => (
            <li key={itemIdx}>{renderInline(item)}</li>
          ))}
        </ListTag>
      );
    }
    if (block.kind === "table") {
      return (
        <div key={idx} className="table-wrap">
          <table>
            <thead>
              <tr>
                {block.headers.map((h, hIdx) => (
                  <th key={hIdx}>{renderInline(h)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rIdx) => (
                <tr key={rIdx}>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    if (block.kind === "kv") {
      return (
        <dl key={idx} className="kv-grid">
          {block.rows.map((row, rIdx) => (
            <Fragment key={rIdx}>
              <dt>{renderInline(row.key)}</dt>
              <dd>{renderInline(row.value)}</dd>
            </Fragment>
          ))}
        </dl>
      );
    }
    return (
      <p key={idx}>
        {block.lines.map((line, lineIdx) => {
          const match = line.match(/^([^:]{1,60}):\s+(.+)$/);
          return (
            <Fragment key={lineIdx}>
              {match ? (
                <>
                  <strong>{renderInline(match[1])}</strong>
                  {": "}
                  {renderInline(match[2])}
                </>
              ) : (
                renderInline(line)
              )}
              {lineIdx < block.lines.length - 1 ? <br /> : null}
            </Fragment>
          );
        })}
      </p>
    );
  });
}
