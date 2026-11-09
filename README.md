# A Corner of 2005

Welcome to your little corner of 2005.

Remember when getting online felt like an event? When you'd sign into MSN, check your inbox, browse eBay for things you definitely didn't need, download music from LimeWire, and lose entire afternoons playing games on the internet.

This is a little recreation of that time. A Windows XP desktop, a familiar collection of websites, old-school games, and all the little details that made being online feel so special.

Take your time, click around, open a few windows, change your status, download a song or two, play a game, and see where you end up.

The internet was a different place back then. Consider this your invitation to go back.

---

## Making the contacts talk back

Out of the box your contacts reply from a script — the same lines every time.
You can instead have them answered for real, in character, by Claude.

Copy `.env.example` to `.env`, put an API key in it, and restart the dev
server:

    cp .env.example .env
    npm run dev

Each contact has a persona in `src/data/personas.ts` — Kez the dramatic best
friend, Dazza half-watching the Xbox, your mum typing in full sentences and
signing off "Love Mum x". They are told it is 2005, they type like it, and
they do not know what came after. Edit that file to change who anyone is.

The key is read by the dev server (`server/chat.ts`) and never reaches the
browser. Without a key everything still works — the contacts just fall back to
their scripts.

---

    npm install
    npm run dev

Build notes are in [docs/NOTES.md](docs/NOTES.md).
