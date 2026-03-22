import React, { useState, useRef } from 'react';
import type { Note } from '../types';
import { NoteCard } from './NoteCard';
import { Send, Maximize2, Minimize2, X, Search } from 'lucide-react';
import { Toolbar, insertTextAtCursor } from './Toolbar';
import dayjs from 'dayjs';

interface FeedProps {
  notes: Note[];
  allNotes: Note[]; // Add this to pass all notes for linking
  onCreateNote: (content: string) => void;
  onCreateComment: (parentId: string, content: string) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

export const Feed: React.FC<FeedProps> = ({ notes, allNotes, onCreateNote, onCreateComment, onUpdateNote, onDeleteNote }) => {
  const [newContent, setNewContent] = useState('');
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkSearch, setLinkSearch] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCreate = () => {
    if (!newContent.trim()) return;
    onCreateNote(newContent);
    setNewContent('');
    setIsFocusMode(false);
  };

  const handleInsert = (prefix: string, suffix?: string) => {
    insertTextAtCursor(textareaRef.current, prefix, suffix, setNewContent);
  };

  const allTags = Array.from(new Set(allNotes.flatMap(n => n.frontmatter.tags || [])));
  
  const filteredLinkNotes = allNotes.filter(n => {
    const fallbackTitle = n.content.split('\n')[0].substring(0, 40);
    const title = (n.frontmatter.title || fallbackTitle).toLowerCase();
    return title.includes(linkSearch.toLowerCase()) || n.content.toLowerCase().includes(linkSearch.toLowerCase());
  }).slice(0, 10);

  const composerStyle: React.CSSProperties = isFocusMode 
    ? { position: 'fixed', top: '5%', left: '50%', transform: 'translateX(-50%)', width: '90%', maxWidth: '900px', height: '90%', zIndex: 100, background: 'var(--bg-panel)', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--shadow-glass)', display: 'flex', flexDirection: 'column' }
    : { background: 'var(--bg-panel)', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border-soft)', boxShadow: 'var(--shadow-sm)', marginBottom: '1.5rem', position: 'relative' };

  return (
    <div style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)', padding: '2rem', scrollBehavior: 'smooth' }}>
      
      {isFocusMode && <div className="modal-backdrop" onClick={() => setIsFocusMode(false)} />}
      
      {showLinkModal && (
        <div className="modal-backdrop" onClick={() => setShowLinkModal(false)} style={{ zIndex: 110 }}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3>Collega Nota</h3>
              <button className="btn-icon" onClick={() => setShowLinkModal(false)}><X size={16}/></button>
            </div>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
              <input autoFocus value={linkSearch} onChange={e => setLinkSearch(e.target.value)} placeholder="Cerca nota..." style={{ width: '100%', paddingLeft: '2rem' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
              {filteredLinkNotes.map(n => {
                const firstLine = n.content.split('\n')[0].replace(/^[#*-]\s+/, '').substring(0, 40) || 'Nota senza testo';
                const displayTitle = n.frontmatter.title || firstLine;
                return (
                  <div key={n.id} onClick={() => { handleInsert(`[${displayTitle}](#${n.id})`); setShowLinkModal(false); }} style={{ padding: '0.75rem', border: '1px solid var(--border-soft)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', marginBottom: '0.5rem', background: 'var(--bg-base)' }}>
                    <div style={{ fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {displayTitle}
                    </div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                      {dayjs(n.frontmatter['updated-at'] || n.frontmatter['created-at']).format('DD MMM YYYY, HH:mm')} &middot; {n.content.length} caratteri
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: '800px', margin: '0 auto', position: isFocusMode ? 'static' : 'relative' }}>
        {/* Composer */}
        <div style={composerStyle}>
          <button className="btn-icon" style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', color: 'var(--text-muted)' }} onClick={() => setIsFocusMode(!isFocusMode)}>
            {isFocusMode ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
          </button>
          
          <textarea
            ref={textareaRef}
            placeholder="Qualsiasi pensiero... (usa #tag per le categorie)"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            style={{ flex: isFocusMode ? 1 : 'none', width: '100%', minHeight: isFocusMode ? 'auto' : '100px', border: 'none', resize: 'vertical', background: 'transparent', boxShadow: 'none', fontSize: isFocusMode ? '1.1rem' : '1rem' }}
          />
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', borderTop: '1px solid var(--border-soft)', paddingTop: '0.75rem' }}>
            <Toolbar 
              onInsert={handleInsert} 
              onTagClick={() => handleInsert('#')} 
              onLinkClick={() => setShowLinkModal(true)}
            />
            <button className="btn btn-primary" onClick={handleCreate} style={{ padding: '0.5rem 1.25rem', flexShrink: 0, marginLeft: 'auto' }}>
              Save <Send size={16} style={{ marginLeft: '4px' }} />
            </button>
          </div>
        </div>

        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {allTags.map(tag => (
              <div 
                key={tag} 
                style={{ background: 'var(--bg-panel)', padding: '0.25rem 0.75rem', borderRadius: '16px', fontSize: '0.85rem', color: 'var(--text-muted)', border: '1px solid var(--border-soft)', cursor: 'pointer' }}
                onClick={() => setNewContent(prev => prev + (prev.endsWith(' ') || prev === '' ? `#${tag} ` : ` #${tag} `))}
              >
                #{tag}
              </div>
            ))}
          </div>
        )}

        {/* Feed List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {notes.filter(n => !n.frontmatter.parentId).map(note => (
            <NoteCard 
              key={note.id} 
              note={note} 
              allNotes={allNotes}
              onUpdate={onUpdateNote} 
              onDelete={() => onDeleteNote(note.id)} 
              onCreateComment={onCreateComment}
            />
          ))}
          {notes.filter(n => !n.frontmatter.parentId).length === 0 && (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
              No notes yet. Share your first thought above!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
