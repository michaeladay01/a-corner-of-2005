const README = `readme.txt  —  C:\\Documents and Settings\\You\\Desktop

heyyy, you're online!

Welcome to 2005. Your computer is ready, MSN is waiting, and someone
probably just sent you a nudge.

Go check your Hotmail, see what's on eBay, download some music on
LimeWire (fingers crossed it's actually the song you wanted), play a
few games and generally get up to no good on the internet.

I've brought back a little bit of the old internet, so have a poke
around, open some windows and make yourself at home.

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
