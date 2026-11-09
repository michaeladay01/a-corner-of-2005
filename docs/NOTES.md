# A Corner of 2005 — notes

An interactive recreation of signing in to MSN Messenger on a Windows XP machine,
built as a browser application. Boot the PC, double-click the shortcut on the
desktop, pick a display name, and your contact list fills up.

```bash
npm install
npm run dev
```

## What's in it

**Startup** — BIOS post, the XP splash, the "welcome" screen, then the desktop.
Skippable at any point, and permanently skippable from Options.

**Desktop** — a vector redraw of the Bliss wallpaper (the hill, sky and clouds are
drawn as an inline SVG so no binary asset ships; drop a `bliss.jpg` into `public/`
and it is used instead, automatically — see `public/README.md`. Four alternative
wallpapers in Options), desktop icons,
draggable/minimisable/resizable windows with Luna title bars, taskbar with Start
menu, quick launch, task buttons and a system tray clock.

**Period accuracy** — the client is MSN Messenger 7.0 (April 2005), so it has
winks, nudges, display pictures and the contact list restyled to match the
conversation windows. The contact list carries the vertical tab strip down its
left edge that 7.x added and everybody wanted rid of, the banner advert above the
status bar, and the MSN Today button. Voice clips and the conversation video
button were 7.5, so they are deliberately absent.

**Messenger** — the contact list with your display picture, editable display name
and personal message, a status dropdown (Online through to Appear Offline),
collapsible groups, presence icons, and contacts who sign in and out while you sit
there.

**Conversations** — transcripts with per-message fonts and colours, emoticon
substitution as you type, the emoticon picker, bold/italic, nudges that shake the
window, winks, scripted replies with typing delays, and conversation history.

**Extras** — a Hotmail inbox (including the chain mail), Internet Explorer,
LimeWire, Minesweeper, Notepad, a Recycle Bin, a profile editor, and a display
picture picker that also accepts your own image.

**LimeWire** — search anything and you get a page of badly named results with star
ratings and source counts. Double-click to download: progress crawls at dial-up
speed, stalls waiting for sources, and roughly one file in four turns out to be
something else entirely. The Library tab lists what is in the shared folder —
including the files that were already there — with a column saying what each one
actually turned out to be. Monitor and Connections tabs are there too.

**eBay** — the 2005 homepage: the numbered Find / Register / Buy panels, the
yellow "World's Online Marketplace" banner, Global Sites and Featured Items, and
a footer of country links. Search the sixteen invented listings, open one and you
get the full item page — current bid, time left counting down, postage, seller
feedback. Bidding works, but you must register first, and someone will come over
the top of you a few seconds later.

**Internet Explorer** — a working IE6 window with back/forward/address bar, an
MSN.co.uk homepage, MSN Search, a GeoCities page and a prize-claim popup that
installs nothing. Unknown addresses get the real "The page cannot be displayed".
The quick-launch IE button opens this; the envelope opens Hotmail.

**The Office Assistant** — Clippy, drawn in SVG, who was actually part of Office
(97–2003) rather than Windows, but turns up here anyway with period-correct
unhelpful suggestions. Dismiss him from his own balloon or from Options.

**Sound** — sign-in, message, nudge, contact-online and the XP startup chime, all
synthesised with the Web Audio API (no audio files ship). Nothing plays before you
interact with the page, and there's a mute toggle in the tray.

## Structure

```
src/data/        contacts, scripted conversations, emoticons, display pictures, emails
src/state/       one reducer holding windows, conversations, presence and settings
src/lib/         sound synthesis, localStorage, pointer dragging
src/components/  boot, desktop (icons/taskbar/start/toasts), window chrome, msn, apps
src/styles/      xp.css (Luna) and msn.css (Messenger)
```

Every icon and display picture is drawn as inline SVG or CSS — there are no binary
assets in the repository.

Conversations are simulated from `src/data/scripts.ts`. Messages flow through the
store as `send-message` / `receive-message` actions with a scheduled delivery
queue, so swapping the script module for a real transport is the only change a
live-messaging version would need.

Display name, personal message, display picture and preferences persist in
localStorage.
