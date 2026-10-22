import { Fragment, type ReactNode } from 'react';

/**
 * Renders the content markup defined in content/SCHEMA.md:
 * **bold**, *italic*, ^{sup}, _{sub}, blank-line paragraphs and "- " bullets.
 */
export function inline(text: string, keyPrefix = 'i'): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*([^*]+)\*\*|\*([^*\s][^*]*?)\*|\^\{([^}]*)\}|_\{([^}]*)\})/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${k++}`;
    if (m[2] !== undefined) out.push(<strong key={key}>{inline(m[2], key)}</strong>);
    else if (m[3] !== undefined) out.push(<em key={key}>{inline(m[3], key)}</em>);
    else if (m[4] !== undefined) out.push(<sup key={key}>{inline(m[4], key)}</sup>);
    else if (m[5] !== undefined) out.push(<sub key={key}>{inline(m[5], key)}</sub>);
    last = re.lastIndex;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markup({ text, className = '' }: { text: string; className?: string }) {
  const blocks = String(text || '').split(/\n\s*\n/);
  return (
    <div className={`prose-card ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split('\n');
        const isList = lines.every((l) => /^\s*[-•]\s+/.test(l) || !l.trim());
        if (isList) {
          return (
            <ul key={bi}>
              {lines.filter((l) => l.trim()).map((l, li) => <li key={li}>{inline(l.replace(/^\s*[-•]\s+/, ''), `${bi}-${li}`)}</li>)}
            </ul>
          );
        }
        // Mixed paragraph + bullets inside one block.
        const parts: ReactNode[] = [];
        let bullets: string[] = [];
        const flush = (key: string) => {
          if (bullets.length) {
            parts.push(<ul key={key}>{bullets.map((b, i) => <li key={i}>{inline(b, `${key}-${i}`)}</li>)}</ul>);
            bullets = [];
          }
        };
        lines.forEach((l, li) => {
          if (/^\s*[-•]\s+/.test(l)) bullets.push(l.replace(/^\s*[-•]\s+/, ''));
          else {
            flush(`${bi}-u${li}`);
            if (l.trim()) parts.push(<p key={`${bi}-p${li}`}>{inline(l, `${bi}-${li}`)}</p>);
          }
        });
        flush(`${bi}-end`);
        return <Fragment key={bi}>{parts}</Fragment>;
      })}
    </div>
  );
}

export function Inline({ text }: { text: string }) {
  return <>{inline(String(text ?? ''))}</>;
}

/** Plain-text version for search and previews. */
export const plain = (s: string) => String(s || '').replace(/\*\*|\*|\^\{|_\{|\}/g, '');
