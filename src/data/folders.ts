/* What the Explorer windows show. Enough of a file system to click around in
   without pretending to be one — the folders people actually opened on the
   family computer, with the things that were actually in them. */

export type Entry = {
  id: string
  name: string
  /** A folder you can open, or a file that just sits there. */
  kind: 'folder' | 'image' | 'audio' | 'text' | 'drive' | 'app'
  /** For folders, the id of the folder to go to. */
  to?: string
  size?: string
  /** Shown in the Details panel when selected. */
  detail?: string
}

export type Folder = {
  id: string
  name: string
  /** The folder its "Up" button and Other Places list point back to. */
  parent?: string
  /** "File and Folder Tasks", or the drive/system variant. */
  tasks: 'file' | 'system' | 'picture' | 'music'
  entries: Entry[]
}

export const FOLDERS: Record<string, Folder> = {
  documents: {
    id: 'documents',
    name: 'My Documents',
    tasks: 'file',
    entries: [
      { id: 'music', name: 'My Music', kind: 'folder', to: 'music' },
      { id: 'pictures', name: 'My Pictures', kind: 'folder', to: 'pictures' },
      {
        id: 'coursework',
        name: 'geography coursework FINAL.doc',
        kind: 'text',
        size: '48 KB',
        detail: 'Microsoft Word Document',
      },
      {
        id: 'coursework2',
        name: 'geography coursework FINAL FINAL.doc',
        kind: 'text',
        size: '51 KB',
        detail: 'Microsoft Word Document',
      },
      {
        id: 'cv',
        name: 'work experience letter.doc',
        kind: 'text',
        size: '22 KB',
        detail: 'Microsoft Word Document',
      },
    ],
  },

  pictures: {
    id: 'pictures',
    name: 'My Pictures',
    parent: 'documents',
    tasks: 'picture',
    entries: [
      { id: 'p1', name: 'town sat night 001.jpg', kind: 'image', size: '412 KB' },
      { id: 'p2', name: 'town sat night 002.jpg', kind: 'image', size: '388 KB' },
      { id: 'p3', name: 'me and kez.jpg', kind: 'image', size: '504 KB' },
      { id: 'p4', name: 'dog.jpg', kind: 'image', size: '233 KB' },
      { id: 'p5', name: 'new msn dp.jpg', kind: 'image', size: '18 KB' },
      { id: 'p6', name: 'Sample Pictures', kind: 'folder', to: 'samples' },
    ],
  },

  samples: {
    id: 'samples',
    name: 'Sample Pictures',
    parent: 'pictures',
    tasks: 'picture',
    entries: [
      { id: 's1', name: 'Blue hills.jpg', kind: 'image', size: '28 KB' },
      { id: 's2', name: 'Sunset.jpg', kind: 'image', size: '71 KB' },
      { id: 's3', name: 'Water lilies.jpg', kind: 'image', size: '82 KB' },
      { id: 's4', name: 'Winter.jpg', kind: 'image', size: '103 KB' },
    ],
  },

  music: {
    id: 'music',
    name: 'My Music',
    parent: 'documents',
    tasks: 'music',
    entries: [
      { id: 'm1', name: 'Sample Music', kind: 'folder', to: 'samplemusic' },
      {
        id: 'm2',
        name: 'Snow_Patrol_-_Chasing_Cars.mp3',
        kind: 'audio',
        size: '4.2 MB',
        detail: 'MP3 Format Sound',
      },
      {
        id: 'm3',
        name: 'the_killers_mr_brightside(1).mp3',
        kind: 'audio',
        size: '3.8 MB',
        detail: 'MP3 Format Sound',
      },
      {
        id: 'm4',
        name: 'Green Day - Boulevard Of Broken Dreams.mp3',
        kind: 'audio',
        size: '4.6 MB',
        detail: 'MP3 Format Sound',
      },
      {
        id: 'm5',
        name: 'track 07.mp3',
        kind: 'audio',
        size: '2.1 MB',
        detail: 'MP3 Format Sound',
      },
    ],
  },

  samplemusic: {
    id: 'samplemusic',
    name: 'Sample Music',
    parent: 'music',
    tasks: 'music',
    entries: [
      { id: 'sm1', name: 'Beethoven’s 5th Symphony.wma', kind: 'audio', size: '4.4 MB' },
      { id: 'sm2', name: 'New Stories (Highway Blues).wma', kind: 'audio', size: '3.1 MB' },
    ],
  },

  computer: {
    id: 'computer',
    name: 'My Computer',
    tasks: 'system',
    entries: [
      { id: 'c1', name: '3½ Floppy (A:)', kind: 'drive', detail: '3½-Inch Floppy Disk' },
      {
        id: 'c2',
        name: 'Local Disk (C:)',
        kind: 'drive',
        detail: 'Local Disk — 2.31 GB free of 37.2 GB',
      },
      { id: 'c3', name: 'CD Drive (D:)', kind: 'drive', detail: 'CD Drive' },
      { id: 'c4', name: 'Shared Documents', kind: 'folder', to: 'shared' },
      { id: 'c5', name: 'My Documents', kind: 'folder', to: 'documents' },
    ],
  },

  shared: {
    id: 'shared',
    name: 'Shared Documents',
    parent: 'computer',
    tasks: 'file',
    entries: [
      { id: 'sd1', name: 'Shared Music', kind: 'folder', to: 'music' },
      { id: 'sd2', name: 'Shared Pictures', kind: 'folder', to: 'pictures' },
      {
        id: 'sd3',
        name: 'PHONE BILL DO NOT DELETE.doc',
        kind: 'text',
        size: '31 KB',
        detail: 'Microsoft Word Document',
      },
    ],
  },
}

/* The headings and links down the left-hand side, which changed depending on
   what sort of folder you were in. */
export const TASK_LINKS: Record<Folder['tasks'], string[]> = {
  file: ['Make a new folder', 'Publish this folder to the Web', 'Share this folder'],
  system: ['View system information', 'Add or remove programs', 'Change a setting'],
  picture: [
    'View as a slide show',
    'Order prints online',
    'Print pictures',
    'Copy all items to CD',
  ],
  music: ['Play all', 'Shop for music online', 'Copy all items to CD'],
}

export const TASK_TITLE: Record<Folder['tasks'], string> = {
  file: 'File and Folder Tasks',
  system: 'System Tasks',
  picture: 'Picture Tasks',
  music: 'Music Tasks',
}
