import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Feed } from './components/Feed';
import { SettingsModal } from './components/SettingsModal';
import { useNotes, useGitHubCredentials } from './store';
import { pushSingleNote, deleteSingleNote } from './github';
import { Menu } from 'lucide-react';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import type { Note } from './types';

function App() {
  const { notes, saveNote, deleteNote, setAllNotes } = useNotes();
  const { creds, saveCreds, clearCreds } = useGitHubCredentials();
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<dayjs.Dayjs | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('notetag-accent') || '#3b82f6');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');

  useEffect(() => {
    localStorage.setItem('notetag-accent', accentColor);
    document.documentElement.style.setProperty('--accent-primary', accentColor);
  }, [accentColor]);

  // Wrappers for Auto-Sync
  const handleSaveNote = async (note: Note) => {
    saveNote(note);
    if (creds) {
      setSyncStatus('syncing');
      try {
        await pushSingleNote(creds, note);
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err) {
        console.error('Auto-sync push failed:', err);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    }
  };

  const handleDeleteNote = async (id: string) => {
    deleteNote(id);
    if (creds) {
      setSyncStatus('syncing');
      try {
        await deleteSingleNote(creds, id);
        setSyncStatus('success');
        setTimeout(() => setSyncStatus('idle'), 3000);
      } catch (err) {
        console.error('Auto-sync delete failed:', err);
        setSyncStatus('error');
        setTimeout(() => setSyncStatus('idle'), 5000);
      }
    }
  };

  const handleCreateNew = (content: string, parentId?: string) => {
    const now = dayjs().toISOString();
    
    // Auto-extract #hashtags from the content
    const extractedTags = Array.from(content.matchAll(/(?:^|\s)#([\w\u00C0-\u017F-]+)/g)).map(m => m[1]);
    const uniqueTags = [...new Set(extractedTags)];

    const frontmatterObj: any = {
      'created-at': now,
      'updated-at': now,
      tags: uniqueTags
    };
    if (parentId) frontmatterObj.parentId = parentId;

    let rawFrontmatter = `---\ncreated-at: ${now}\nupdated-at: ${now}\ntags: [${uniqueTags.map(t => `"${t}"`).join(', ')}]\n`;
    if (parentId) rawFrontmatter += `parentId: "${parentId}"\n`;
    rawFrontmatter += `---\n${content}`;

    const newNote = {
      id: uuidv4(),
      content,
      frontmatter: frontmatterObj,
      raw: rawFrontmatter
    };
    handleSaveNote(newNote);
  };

  const filteredNotes = notes
    .filter(n => {
      let matchesDate = true;
      let matchesSearch = true;
      
      if (filterDate) {
        matchesDate = dayjs(n.frontmatter['updated-at']).isSame(filterDate, 'day');
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        matchesSearch = n.content.toLowerCase().includes(query) || (n.frontmatter.tags && n.frontmatter.tags.some(t => t.toLowerCase().includes(query)));
      }
      
      return matchesDate && matchesSearch;
    })
    .sort((a,b) => dayjs(b.frontmatter['updated-at']).valueOf() - dayjs(a.frontmatter['updated-at']).valueOf());

  return (
    <div className="app-container">
      {/* Mobile Top Header */}
      <div className="mobile-header">
        <button className="btn-icon" onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} style={{ color: 'var(--text-main)' }} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <img src="/logo.png" width={24} height={24} alt="NoteTag" style={{ borderRadius: '6px' }} onError={(e) => e.currentTarget.style.display = 'none'} />
          <h1 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em' }}>NOTETAG</h1>
        </div>
      </div>

      <div className={`sidebar-container ${isMobileMenuOpen ? 'open' : ''}`}>
        <Sidebar 
          notes={notes} 
          onOpenSettings={() => { setIsSettingsOpen(true); setIsMobileMenuOpen(false); }}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          syncStatus={syncStatus}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        {isMobileMenuOpen && <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />}
      </div>
      
      <div className="feed-container">
        <Feed 
          notes={filteredNotes}
          allNotes={notes}
          onCreateNote={(c) => handleCreateNew(c)}
          onCreateComment={(parentId, c) => handleCreateNew(c, parentId)}
          onUpdateNote={handleSaveNote}
          onDeleteNote={handleDeleteNote}
        />
      </div>

      {isSettingsOpen && (
        <SettingsModal 
          creds={creds}
          onSaveCreds={saveCreds}
          onClearCreds={clearCreds}
          onClose={() => setIsSettingsOpen(false)}
          localNotes={notes}
          onSyncComplete={(pulled) => setAllNotes(pulled)}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
        />
      )}
    </div>
  );
}

export default App;
