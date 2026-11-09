const README = `readme.txt  —  C:\\Documents and Settings\\You\\Desktop

Welcome to your little corner of 2005.

Remember when getting online felt like an event? When you'd sign into
MSN, check your inbox, browse eBay for things you definitely didn't
need, download music from LimeWire, and lose entire afternoons playing
games on the internet.

This is a little recreation of that time. A Windows XP desktop, a
familiar collection of websites, old-school games, and all the little
details that made being online feel so special.

Take your time, click around, open a few windows, change your status,
download a song or two, play a game, and see where you end up.

The internet was a different place back then. Consider this your
invitation to go back.

`

export function Notepad() {
  return (
    <>
      <div className="menubar">
        {['File', 'Edit', 'Format', 'View', 'Help'].map((m) => (
          <button key={m}>{m}</button>
        ))}
      </div>
      <pre className="notepad-text scroll">{README}</pre>
    </>
  )
}
