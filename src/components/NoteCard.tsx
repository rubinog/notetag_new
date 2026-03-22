import React, { useState, useRef } from 'react';
import type { Note } from '../types';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import markdownit from 'markdown-it';
// @ts-ignore
import taskLists from 'markdown-it-task-lists';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';
import { MoreVertical, Trash2, Edit2, X, Check, Reply, AlertTriangle } from 'lucide-react';
import { stringifyMarkdown } from '../utils/markdown';
import { Toolbar, insertTextAtCursor } from './Toolbar';
import { LinkModal } from './LinkModal';

dayjs.extend(relativeTime);

function hashtagPlugin(md: any) {
  md.inline.ruler.push('hashtag', (state: any, silent: boolean) => {
    const src = state.src;
    const pos = state.pos;
    if (src[pos] !== '#') return false;
    
    if (pos > 0 && !/\s/.test(src[pos - 1])) return false;

    const match = src.slice(pos).match(/^#([\w\u00C0-\u017F-]+)/);
    if (!match) return false;

    if (!silent) {
      const token = state.push('html_inline', '', 0);
      token.content = `<span class="hashtag">${match[0]}</span>`;
    }
    state.pos += match[0].length;
    return true;
  });
}

const md = markdownit({ 
  html: true, 
  linkify: true, 
  breaks: true,
  highlight: function (str: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (__) {}
    }
    return ''; 
  }
}).use(taskLists, { enabled: true }).use(hashtagPlugin);

export const NoteCard: React.FC<{ 
  note: Note; 
  allNotes?: Note[]; 
  onUpdate: (n: Note) => void; 
  onDelete: () => void;
  onCreateComment?: (parentId: string, content: string) => void;
}> = ({ note, allNotes = [], onUpdate, onDelete, onCreateComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(note.content);
  const [showMenu, setShowMenu] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkTarget, setLinkTarget] = useState<'edit' | 'reply'>('edit');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const replyRef = useRef<HTMLTextAreaElement>(null);

  const handleInsert = (prefix: string, suffix?: string) => {
    insertTextAtCursor(textareaRef.current, prefix, suffix, setEditContent);
  };

  const handleSave = () => {
    const extractedTags = Array.from(editContent.matchAll(/(?:^|\s)#([\w\u00C0-\u017F-]+)/g)).map(m => m[1]);
    const existingTags = note.frontmatter.tags || [];
    const mergedTags = [...new Set([...existingTags, ...extractedTags])];

    const newFrontmatter = {
      ...note.frontmatter,
      'updated-at': new Date().toISOString(),
      tags: mergedTags
    };

    onUpdate({
      ...note,
      content: editContent,
      frontmatter: newFrontmatter,
      raw: stringifyMarkdown(newFrontmatter, editContent)
    });
    setIsEditing(false);
  };

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      const isChecked = (target as HTMLInputElement).checked;
      
      const container = e.currentTarget;
      const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
      const index = checkboxes.indexOf(target as HTMLInputElement);
      
      if (index !== -1) {
        let count = -1;
        const newContent = note.content.replace(/- \[[ xX]\]/gi, (match) => {
          count++;
          if (count === index) {
            return isChecked ? '- [x]' : '- [ ]';
          }
          return match;
        });

        const existingTags = note.frontmatter.tags || [];
        const mergedTags = [...new Set([...existingTags])];

        const newFrontmatter = {
          ...note.frontmatter,
          'updated-at': new Date().toISOString(),
          tags: mergedTags
        };

        onUpdate({
          ...note,
          content: newContent,
          frontmatter: newFrontmatter,
          raw: stringifyMarkdown(newFrontmatter, newContent)
        });
      }
    }
  };

  return (
    <div id={note.id} className="note-card-container" style={{ background: 'var(--bg-panel)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-sm)', position: 'relative' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {dayjs(note.frontmatter['updated-at']).fromNow()}
        </span>
        
        <div style={{ position: 'relative' }}>
          <button className="btn-icon" onClick={() => setShowMenu(!showMenu)}><MoreVertical size={16}/></button>
          {showMenu && (
            <div style={{ position: 'absolute', right: 0, top: '100%', background: 'var(--bg-panel)', border: '1px solid var(--border-soft)', borderRadius: '8px', padding: '0.5rem', boxShadow: 'var(--shadow-md)', zIndex: 10, minWidth: '120px' }}>
              <button 
                className="btn-icon" 
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-main)', padding: '0.5rem' }} 
                onClick={() => { setIsReplying(!isReplying); setShowMenu(false); }}
              >
                <Reply size={14} style={{ marginRight: '8px' }}/> Reply
              </button>
              <button 
                className="btn-icon" 
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--text-main)', padding: '0.5rem' }} 
                onClick={() => { setIsEditing(true); setShowMenu(false); }}
              >
                <Edit2 size={14} style={{ marginRight: '8px' }}/> Edit
              </button>
              <button 
                className="btn-icon" 
                style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--danger)', padding: '0.5rem' }} 
                onClick={() => { 
                  setShowDeleteConfirm(true);
                  setShowMenu(false); 
                }}
              >
                <Trash2 size={14} style={{ marginRight: '8px' }}/> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div style={{ background: 'rgba(0,0,0,0.02)', padding: '0.5rem', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
          <textarea 
            ref={textareaRef}
            style={{ width: '100%', minHeight: '100px', background: 'transparent', border: 'none', outline: 'none', resize: 'vertical' }}
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--border-soft)', paddingTop: '0.5rem' }}>
            <Toolbar onInsert={handleInsert} onLinkClick={() => { setLinkTarget('edit'); setShowLinkModal(true); }} />
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn" onClick={() => setIsEditing(false)}><X size={14}/> Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Check size={14}/> Save</button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <LinkModal 
            isOpen={showLinkModal} 
            onClose={() => setShowLinkModal(false)} 
            allNotes={allNotes}
            onSelect={(targetNote) => {
              const fallbackTitle = targetNote.content.split('\n')[0].replace(/^[#*-]\s+/, '').substring(0, 30);
              const title = targetNote.frontmatter.title || fallbackTitle;
              const link = `[${title}](#${targetNote.id})`;
              if (linkTarget === 'edit') {
                handleInsert(link);
              } else {
                insertTextAtCursor(replyRef.current, link, '', setReplyContent);
              }
            }}
          />
          <div className="markdown-body" onClick={handleContentClick} dangerouslySetInnerHTML={{ __html: md.render(note.content) }} />
          
          {/* Nested Comments */}
          {allNotes.filter(n => n.frontmatter.parentId === note.id).length > 0 && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px dashed var(--border-soft)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {allNotes.filter(n => n.frontmatter.parentId === note.id).map(child => (
                <div key={child.id} style={{ paddingLeft: '1rem', borderLeft: '3px solid var(--border-soft)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{dayjs(child.frontmatter['updated-at']).fromNow()}</span>
                  <div className="markdown-body" style={{ fontSize: '0.9rem' }} dangerouslySetInnerHTML={{ __html: md.render(child.content) }} />
                </div>
              ))}
            </div>
          )}
          
          {/* Reply Box */}
          {isReplying && (
            <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.02)', borderRadius: '8px', border: '1px solid var(--border-soft)' }}>
              <textarea 
                ref={replyRef}
                placeholder="Lascia un commento..."
                style={{ width: '100%', minHeight: '60px', background: 'transparent', border: 'none', outline: 'none', resize: 'vertical' }}
                value={replyContent}
                onChange={e => setReplyContent(e.target.value)}
                autoFocus
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                <Toolbar onInsert={(pre, suf) => insertTextAtCursor(replyRef.current, pre, suf, setReplyContent)} onLinkClick={() => { setLinkTarget('reply'); setShowLinkModal(true); }} />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn" onClick={() => setIsReplying(false)}>Cancel</button>
                  <button className="btn btn-primary" onClick={() => { if(onCreateComment){ onCreateComment(note.id, replyContent); setReplyContent(''); setIsReplying(false); } }}>Reply</button>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          onClick={() => setShowDeleteConfirm(false)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{ background: 'var(--bg-panel)', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '350px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-lg)' }}
          >
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.1rem' }}>
              <AlertTriangle size={18} style={{ color: 'var(--danger)' }} /> Elimina Nota
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Sei sicuro di voler eliminare questa nota e tutti i suoi commenti? L'azione non può essere annullata.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button className="btn" onClick={() => setShowDeleteConfirm(false)}>Annulla</button>
              <button className="btn" style={{ background: 'var(--danger)', color: 'white', border: 'none' }} onClick={() => { onDelete(); setShowDeleteConfirm(false); }}>
                Elimina
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
