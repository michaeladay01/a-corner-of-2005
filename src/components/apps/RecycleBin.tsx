import { FolderIcon, NotepadIcon, RecycleBinIcon } from '../Icons'

const ITEMS = [
  { label: 'coursework FINAL.doc', icon: <NotepadIcon size={30} /> },
  { label: 'coursework FINAL 2.doc', icon: <NotepadIcon size={30} /> },
  { label: 'limewire downloads', icon: <FolderIcon size={30} /> },
  { label: 'dp_old.jpg', icon: <NotepadIcon size={30} /> },
  { label: 'quiz_fwd_fwd.txt', icon: <NotepadIcon size={30} /> },
]

export function RecycleBin() {
  return (
    <>
      <div className="menubar">
        {['File', 'Edit', 'View', 'Favorites', 'Tools', 'Help'].map((m) => (
          <button key={m}>{m}</button>
        ))}
      </div>
      <div className="bin-body">
        <div className="bin-items">
          {ITEMS.map((item) => (
            <div className="bin-item" key={item.label}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
        <div style={{ width: 110, flex: 'none', color: '#4a5a6a', lineHeight: 1.5 }}>
          <RecycleBinIcon size={44} />
          <div style={{ marginTop: 6, fontWeight: 'bold' }}>Recycle Bin</div>
          {ITEMS.length} objects
        </div>
      </div>
    </>
  )
}
