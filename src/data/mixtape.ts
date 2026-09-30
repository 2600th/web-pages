/**
 * Tapes for the cassette player. PROTOTYPE: the rock tracklists are samples to show the
 * layout; the owner supplies the real ones. Rock tapes play through a streaming embed;
 * the last tape is the site's own synthesized line tones.
 */
export type Tape = {
  id: string;
  title: string;
  /** Label paper, ink, printed stripes and shell colour. */
  label: string;
  ink: string;
  stripes: string[];
  shell: string;
  side: { a: string[]; b: string[] };
  source: 'stream' | 'tones';
};

export const TAPES: Tape[] = [
  {
    id: 'build',
    title: 'Build nights',
    label: '#e8b45a', ink: '#1a1206', stripes: ['#1a1206', '#2447d8'], shell: '#15161c',
    side: {
      a: ['Back in Black · AC/DC', 'Enter Sandman · Metallica', 'Smells Like Teen Spirit · Nirvana', 'Killing in the Name · Rage Against the Machine', 'The Pretender · Foo Fighters'],
      b: ['Seven Nation Army · The White Stripes', 'Paranoid · Black Sabbath', 'Kickstart My Heart · Mötley Crüe', 'Everlong · Foo Fighters'],
    },
    source: 'stream',
  },
  {
    id: 'ship',
    title: 'Ship it',
    label: '#f1ede2', ink: '#10131f', stripes: ['#2447d8', '#e8b45a', '#2447d8'], shell: '#e6e2d6',
    side: {
      a: ['Thunderstruck · AC/DC', 'Welcome to the Jungle · Guns N’ Roses', 'Livin’ on a Prayer · Bon Jovi', 'Master of Puppets · Metallica'],
      b: ['Highway Star · Deep Purple', 'Barracuda · Heart', 'Bohemian Rhapsody · Queen', 'Crazy Train · Ozzy Osbourne'],
    },
    source: 'stream',
  },
  {
    id: 'drive',
    title: 'Long drive',
    label: '#9db6ff', ink: '#0b1238', stripes: ['#0b1238', '#f1ede2'], shell: '#1d2a6b',
    side: {
      a: ['Hotel California · Eagles', 'Comfortably Numb · Pink Floyd', 'Sweet Child O’ Mine · Guns N’ Roses', 'Dream On · Aerosmith'],
      b: ['Stairway to Heaven · Led Zeppelin', 'Wish You Were Here · Pink Floyd', 'Black · Pearl Jam', 'Under the Bridge · Red Hot Chili Peppers'],
    },
    source: 'stream',
  },
  {
    id: 'line',
    title: 'Line idle',
    label: '#0b0e1a', ink: '#9db6ff', stripes: ['#2447d8', '#4d74ff', '#9db6ff'], shell: '#0a0a0f',
    side: {
      a: ['KP · 2 · 6 · 0 · 0 · ST', 'Seize: 2600 Hz', 'Dial tone: 350 + 440 Hz'],
      b: ['MF digits 0 to 9', 'Busy signal: 480 + 620 Hz', 'Line idle'],
    },
    source: 'tones',
  },
];
