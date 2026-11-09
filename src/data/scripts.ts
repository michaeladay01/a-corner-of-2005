// Simulated conversations. Each contact has an opening transcript plus a pool of
// scripted replies that are played back as you type. Swapping this module for a
// transport layer is all that real-time messaging would need.

export type ScriptLine = string | string[]

type Script = {
  history?: { from: 'me' | 'them'; text: string; minutesAgo: number }[]
  opener?: string[]
  replies: ScriptLine[]
  nudgeReply?: string[]
  winkReply?: string[]
}

export const SCRIPTS: Record<string, Script> = {
  kez: {
    history: [
      { from: 'them', text: 'hiya!! :)', minutesAgo: 44 },
      { from: 'me', text: 'hey! you alright?', minutesAgo: 43 },
      { from: 'them', text: 'yeh. did u do the maths hw?? (6)', minutesAgo: 42 },
      { from: 'me', text: 'no lol', minutesAgo: 41 },
      { from: 'them', text: 'omg same... were gonna get detention', minutesAgo: 40 },
    ],
    opener: ['heyyy :)', 'omg guess what'],
    replies: [
      'nuthin much, just bored lol',
      'omg tell me everything!!!',
      ['hang on', 'mums shouting me ¬_¬'],
      'back :P',
      'ur so funny (H)',
      'aww :( ',
      'l8r m8 xx',
      'brb phoneeee',
      'did u see hollyoaks last nite?!',
      ['soooo', 'who do u fancy then', 'u HAVE to tell me'],
      'im not telling anyone i swear (A)',
      'g2g tea ready!! bbl xxx',
    ],
    nudgeReply: ['OI stop nudging me!! :@', 'lol ur such a pest'],
    winkReply: ['hahahaha :D'],
  },
  dazza: {
    history: [
      { from: 'them', text: 'u on halo l8r?', minutesAgo: 12 },
      { from: 'me', text: 'maybe, got homework', minutesAgo: 11 },
      { from: 'them', text: 'boooo', minutesAgo: 10 },
    ],
    opener: ['alrite'],
    replies: [
      'u gettin on xbox or wot',
      'nah im rubbish at that map',
      'brb nans here',
      'back',
      'lol',
      'safe m8',
      'my mums makin me get off in 10 mins',
      'add my m8 hes called dazzasm8 lol',
      'gtg, l8rs',
    ],
    nudgeReply: ['STOP IT', 'ill nudge u back watch'],
  },
  liam: {
    opener: ['hellooooo', 'finally someone online!!'],
    replies: [
      'im soooo bored',
      'what u up to',
      'nothin here either',
      'wanna do a quiz? ill send u one',
      'ok heres one: who do u like most on ur list?? (dont say me lol)',
      'HAHA knew it',
      'send that quiz to 10 ppl or u get bad luck 4 10 yrs',
      'im off to get tea, bbl :)',
    ],
    nudgeReply: ['hahaha do it again'],
  },
  jordan: {
    opener: ['shhh im meant 2 b doing coursework'],
    replies: [
      'how many words have u done',
      'ive done 112 words and 3 title pages lol',
      'word art is basically half the marks',
      'omg is it due tomorrow?!?!',
      'right im actually doing it now. dont msg me',
      'ok one more msg',
      '...',
      'ok im going. srsly. bye',
    ],
    nudgeReply: ['DONT i nearly lost my coursework :@'],
  },
  bigbro: {
    opener: ['get off the computer', 'im downloading'],
    replies: [
      'ur using the bandwidth',
      '47% dont touch anything',
      'if mum picks up the phone im blaming u',
      'did u delete my limewire folder',
      'whatever. 10 more mins then its my turn',
      'MUUUUUM',
    ],
    nudgeReply: ['dont nudge me when im downloading!!!'],
  },
  tom: {
    opener: ['im away but go on'],
    replies: [
      'ye im here',
      'just watchin telly',
      'did u get the new phone?',
      'mines a 3310 lol unbreakable',
      'anyway what u doin 2moz',
      'cba with school',
      'right im actually away now ¬_¬',
    ],
  },
  em: {
    opener: ['back! hair soaking wet lol'],
    replies: [
      'what did i miss',
      'omg really?!',
      'ive got nothing to wear 2moz',
      'can i borrow ur top? the blue one',
      'thankuuuu ♥',
      'gtg drying my hair xx',
    ],
    nudgeReply: ['stooop lol'],
  },
  sophie: {
    opener: ['heyy cant talk long, danny is ringing me'],
    replies: [
      'hes sooo lovely',
      'we have been together 2 weeks 3 days today ♥',
      'do u think thats long?',
      'omg hes calling, g2g!!! bye xxx',
    ],
  },
  chloe: {
    opener: ['back from tea!'],
    replies: ['we had spag bol', 'what u havin', 'nice :)', 'wanna play a game? ill start'],
  },
  mum: {
    opener: ['How do I make the writing bigger'],
    replies: [
      'It keeps saying something about Java',
      'I have pressed it',
      'Oh it has gone now',
      'Thank you love. Tea in ten minutes',
      'xxx',
    ],
  },
  nat: {
    opener: ['heyy im back on :)'],
    replies: ['missed u lol', 'what we doin at the weekend', 'cinema? x', 'yay!! ♥'],
  },
  ryan: {
    opener: ['listen to this'],
    replies: [
      'i nearly got the solo',
      'ok i got 2 notes of the solo',
      'gonna start a band, u can do backing vocals',
      'band name ideas: Crimson Fury',
      'ok maybe not',
    ],
  },
  megan: {
    opener: ['hiya!! ive changed my name again'],
    replies: ['do u like my dp?', 'i got it off a website', 'ill send u the link', 'byeee x'],
  },
  ict: {
    opener: ['Please do not use Messenger on the school network.'],
    replies: ['This is being logged.', 'Thank you.'],
  },
}

const FALLBACK = ['lol', 'yeh', 'ok', 'rly?', 'haha', 'i no', ':)', 'wait wot', 'g2g soon']

export function replyFor(contactId: string, index: number): string[] {
  const script = SCRIPTS[contactId]
  const pool = script?.replies ?? []
  if (index < pool.length) {
    const line = pool[index]
    return Array.isArray(line) ? line : [line]
  }
  return [FALLBACK[index % FALLBACK.length]]
}

export function nudgeReplyFor(contactId: string): string[] {
  return SCRIPTS[contactId]?.nudgeReply ?? ['haha stop it', 'ill get u back for that']
}

export function winkReplyFor(contactId: string): string[] {
  return SCRIPTS[contactId]?.winkReply ?? ['lol where did u get that']
}
