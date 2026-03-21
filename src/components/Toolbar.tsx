import { Bold, Italic, Underline, List, ListTodo, Tag, Code, Link } from 'lucide-react';

interface ToolbarProps {
  onInsert: (prefix: string, suffix?: string) => void;
  onTagClick?: () => void;
  onLinkClick?: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ onInsert, onTagClick, onLinkClick }) => {
  return (
    <div style={{ display: 'flex', gap: '0.25rem', color: 'var(--text-muted)' }}>
      <button type="button" className="btn-icon" title="Grassetto" onClick={() => onInsert('**', '**')}><Bold size={16} /></button>
      <button type="button" className="btn-icon" title="Corsivo" onClick={() => onInsert('*', '*')}><Italic size={16} /></button>
      <button type="button" className="btn-icon" title="Sottolineato" onClick={() => onInsert('<u>', '</u>')}><Underline size={16} /></button>
      <button type="button" className="btn-icon" title="Elenco Puntato" onClick={() => onInsert('- ')}><List size={16} /></button>
      <button type="button" className="btn-icon" title="Elenco da Spuntare" onClick={() => onInsert('- [ ] ')}><ListTodo size={16} /></button>
      <button type="button" className="btn-icon" title="Codice" onClick={() => onInsert('\n```javascript\n', '\n```\n')}><Code size={16} /></button>
      {onTagClick && (
        <button type="button" className="btn-icon" title="Aggiungi Tag" onClick={onTagClick}><Tag size={16} /></button>
      )}
      {onLinkClick && (
        <button type="button" className="btn-icon" title="Collega Nota" onClick={onLinkClick}><Link size={16} /></button>
      )}
    </div>
  );
};

export const insertTextAtCursor = (
  el: HTMLTextAreaElement | null,
  prefix: string,
  suffix: string = '',
  setContent: (val: string) => void
) => {
  if (!el) return;
  const start = el.selectionStart;
  const end = el.selectionEnd;
  const text = el.value;
  const before = text.substring(0, start);
  const selected = text.substring(start, end);
  const after = text.substring(end, text.length);

  // If it's a list prefix and we are not at the start of a line, we can prepend a newline
  let finalPrefix = prefix;
  if (prefix.startsWith('-') && before.length > 0 && !before.endsWith('\n')) {
    finalPrefix = '\n' + prefix;
  }

  const newText = before + finalPrefix + selected + suffix + after;
  setContent(newText);
  
  // Set cursor position after React re-renders
  setTimeout(() => {
    el.focus();
    if (selected.length === 0) {
      el.setSelectionRange(start + finalPrefix.length, start + finalPrefix.length);
    } else {
      el.setSelectionRange(start + finalPrefix.length, start + finalPrefix.length + selected.length);
    }
  }, 0);
};
