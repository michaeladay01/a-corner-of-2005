export type Folder = 'Inbox' | 'Junk Mail' | 'Drafts' | 'Sent Messages' | 'Trash Can'

export type Email = {
  id: string
  from: string
  fromAddress: string
  to?: string
  cc?: string
  subject: string
  at: string
  unread: boolean
  body: string
  folder: Folder
  /** Written by the user rather than received. */
  outgoing?: boolean
}

export const FOLDERS: Folder[] = ['Inbox', 'Junk Mail', 'Drafts', 'Sent Messages', 'Trash Can']

export const ME = 'michaela_x0x@hotmail.com'

export const EMAILS: Email[] = [
  {
    id: 'e1',
    from: 'MSN Hotmail Staff',
    fromAddress: 'staff@hotmail.com',
    subject: 'Welcome to MSN Hotmail!',
    at: 'Tue 14/06/2005 16:02',
    unread: false,
    folder: 'Inbox',
    body:
      'Thank you for signing up for MSN Hotmail. You have 2MB of free storage.\n\n' +
      'To get more storage, upgrade to MSN Hotmail Plus today.\n\n- The MSN Hotmail Team',
  },
  {
    id: 'e2',
    from: '~*~KeZ~*~',
    fromAddress: 'kerry_luvs_music_x@hotmail.com',
    subject: 'FWD: FWD: FWD: READ THIS OR BAD LUCK FOR 10 YEARS!!!!',
    at: 'Wed 15/06/2005 19:41',
    unread: true,
    folder: 'Inbox',
    body:
      'send this to 10 people in the next 10 minutes and your crush will msg you tonite!!!\n\n' +
      'if you delete this you will have bad luck for 10 years!!!!!\n\nIT WORKED FOR ME I SWEAR xxxxx',
  },
  {
    id: 'e3',
    from: 'Dazza',
    fromAddress: 'dazza_1990@hotmail.co.uk',
    subject: 'funny.jpg',
    at: 'Wed 15/06/2005 20:14',
    unread: true,
    folder: 'Inbox',
    body: 'LOOK AT THIS\n\n[attachment: funny.jpg (34 KB)]\n\nlol',
  },
  {
    id: 'e4',
    from: 'Mr Harrison',
    fromAddress: 'p.harrison@school.sch.uk',
    subject: 'Geography coursework DEADLINE',
    at: 'Tue 14/06/2005 08:55',
    unread: false,
    folder: 'Inbox',
    body:
      'A reminder that your coursework is due in FRIDAY FIRST THING.\n\n' +
      'Title pages do not count towards the word limit.\n\nP. Harrison',
  },
  {
    id: 'e5',
    from: 'MSN Messenger',
    fromAddress: 'messenger@msn.com',
    subject: 'Get the new Messenger winks and emoticons!',
    at: 'Mon 13/06/2005 11:20',
    unread: false,
    folder: 'Inbox',
    body: 'Over 50 new winks available. Express yourself!\n\nDownload now (requires Windows XP).',
  },
  {
    id: 'e6',
    from: 'Em',
    fromAddress: 'emmaaa_xo@hotmail.com',
    subject: 'sat night',
    at: 'Wed 15/06/2005 21:03',
    unread: true,
    folder: 'Inbox',
    body:
      'rite so is it still town on sat?? my mum says she can drop us at half 7 but we have to\n' +
      'be back for 11 WHICH IS SO UNFAIR.\n\n' +
      'also can i borrow ur blue top. the one with the sleeves. pleeeease\n\nem xxx',
  },
  {
    id: 'e7',
    from: 'eBay',
    fromAddress: 'noreply@ebay.co.uk',
    subject: 'You have been outbid on: Nokia 3310 MOBILE PHONE UNLOCKED retro brick',
    at: 'Wed 15/06/2005 18:22',
    unread: true,
    folder: 'Inbox',
    body:
      'Dear michaela_x0x,\n\n' +
      'You have been outbid on item 4530981221. The current bid is now £13.50.\n\n' +
      'There are 2 hours 12 minutes left in this auction. Bid again to stay in the running.\n\n' +
      'Do not reply to this message. This is an automated notification.',
  },
  {
    id: 'e8',
    from: 'Play.com',
    fromAddress: 'orders@play.com',
    subject: 'Your order has been dispatched',
    at: 'Mon 13/06/2005 09:47',
    unread: false,
    folder: 'Inbox',
    body:
      'Thank you for shopping with us. The following item has been dispatched:\n\n' +
      '  1 x CD — various artists — £9.99\n  Delivery: Royal Mail, 3-5 working days, FREE\n\n' +
      'Order total: £9.99\n\nYour order reference is PL-8841203.',
  },
  {
    id: 'e9',
    from: 'Ste',
    fromAddress: 'steve_1986@hotmail.com',
    subject: 'get off the computer',
    at: 'Wed 15/06/2005 20:51',
    unread: true,
    folder: 'Inbox',
    body: 'im downloading\n\nseriously get off\n\nim telling mum',
  },
  {
    id: 'e10',
    from: 'Smash Hits',
    fromAddress: 'newsletter@smashhits.co.uk',
    subject: 'This week: posters, the chart rundown and a free sticker sheet',
    at: 'Tue 14/06/2005 07:15',
    unread: false,
    folder: 'Inbox',
    body:
      'IN THIS WEEK’S ISSUE\n\n' +
      '* Double-sided poster\n* Who is going out with who — the full list\n' +
      '* Win a stereo!!\n* Your letters\n\nOn sale Wednesday. Ask your newsagent to reserve a copy.',
  },
  {
    id: 'e11',
    from: 'Nat',
    fromAddress: 'natalie_x92@hotmail.com',
    subject: 're: re: re: ur quiz thing',
    at: 'Tue 14/06/2005 22:38',
    unread: false,
    folder: 'Inbox',
    body:
      '1. blue\n2. pizza\n3. not telling u\n4. probably liam but DO NOT SAY ANYTHING\n' +
      '5. geography\n6. no\n\nright ur turn, send it back xx',
  },
  {
    id: 'e12',
    from: 'Freeserve',
    fromAddress: 'billing@freeserve.co.uk',
    subject: 'Your broadband is now connected',
    at: 'Fri 10/06/2005 14:09',
    unread: false,
    folder: 'Inbox',
    body:
      'Your 512k broadband service is now active.\n\n' +
      'You no longer need to dial up to connect. Your monthly charge is £17.99.\n\n' +
      'Please allow up to 10 days for your free modem to arrive.',
  },
  {
    id: 'j1',
    from: 'WINNER NOTIFICATION',
    fromAddress: 'claims@prize-dept-intl.biz',
    subject: 'CONGRATULATIONS!!! YOU HAVE WON A FREE IPOD',
    at: 'Wed 15/06/2005 03:12',
    unread: true,
    folder: 'Junk Mail',
    body:
      'YOU ARE TODAY’S LUCKY WINNER!!!\n\nTo claim simply reply with your full name,\n' +
      'address and bank details within 24 hours.\n\nThis is NOT a scam.',
  },
  {
    id: 'j2',
    from: 'Ringtone Club',
    fromAddress: 'tones@mobiletonesdirect.net',
    subject: 'Get 5 FREE ringtones today!!',
    at: 'Tue 14/06/2005 17:44',
    unread: false,
    folder: 'Junk Mail',
    body:
      'Text TONE to 80808 to get started.\n\n' +
      '£3 per week subscription. Ask the bill payer’s permission. ' +
      'To cancel text STOP. Good luck with that.',
  },
  {
    id: 's1',
    from: 'Me',
    fromAddress: ME,
    to: 'kerry_luvs_music_x@hotmail.com',
    subject: 're: FWD: FWD: FWD: READ THIS OR BAD LUCK FOR 10 YEARS!!!!',
    at: 'Wed 15/06/2005 19:52',
    unread: false,
    folder: 'Sent Messages',
    outgoing: true,
    body: 'im not sending this to 10 people im not doing it\n\n...ok ive sent it to 10 people',
  },
]

/** Emails that turn up while you are sitting in the inbox. */
export const INCOMING: Omit<Email, 'folder' | 'unread'>[] = [
  {
    id: 'n1',
    from: 'sophie',
    fromAddress: 'sophielovesdanny@hotmail.com',
    subject: 'OMG',
    at: 'just now',
    body: 'CALL ME. or msg me. or something.\n\nactually msg me my mum is on the phone',
  },
  {
    id: 'n2',
    from: 'eBay',
    fromAddress: 'noreply@ebay.co.uk',
    subject: 'Auction ending soon: Nokia 3310 MOBILE PHONE UNLOCKED retro brick',
    at: 'just now',
    body:
      'The auction you are watching ends in 10 minutes.\n\n' +
      'Current bid: £13.50. You are not the highest bidder.',
  },
]
