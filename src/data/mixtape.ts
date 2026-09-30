/**
 * The tapes on Side B. Songs stream from their official YouTube uploads (verified video ids);
 * nothing is hosted here. The last tape is the site's own synthesized line tones.
 */
export type Track = { title: string; artist: string; id?: string };
export type Tape = {
  id: string;
  title: string;
  /** Shown under the title on the J-card. */
  note: string;
  /** Label paper, ink, printed stripes and shell colour. */
  label: string;
  ink: string;
  stripes: string[];
  shell: string;
  side: { a: Track[]; b: Track[] };
  source: 'youtube' | 'tones';
};

const lp = (title: string, id: string): Track => ({ title, artist: 'Linkin Park', id });

export const TAPES: Tape[] = [
  {
    id: 'hybrid',
    title: 'Hybrid nights',
    note: 'Linkin Park · 2000–2003',
    label: '#e8b45a', ink: '#1a1206', stripes: ['#1a1206', '#c8331f'], shell: '#15161c',
    side: {
      a: [lp('One Step Closer', '4qlCC1GOwFw'), lp('Papercut', 'vjVkXlxsO8Q'), lp('In the End', 'eVTXPUF4Oz4'), lp('Crawling', 'Gd9OhYroLN0')],
      b: [lp('Faint', 'LYU-8IFcDPw'), lp('Numb', 'kXYiU_JCYtU'), lp('Somewhere I Belong', 'zsCD5XCu6CM'), lp('Breaking the Habit', 'v2H4l9RpkwM')],
    },
    source: 'youtube',
  },
  {
    id: 'midnight',
    title: 'Midnight builds',
    note: 'Linkin Park · 2007–2024',
    label: '#f1ede2', ink: '#10131f', stripes: ['#2447d8', '#e8b45a', '#2447d8'], shell: '#e6e2d6',
    side: {
      a: [lp('What I’ve Done', '8sgycukafqQ'), lp('Bleed It Out', 'OnuuYcqhzCE'), lp('Shadow of the Day', 'n1PCW0C1aiM'), lp('New Divide', 'ysSxxIqKNN0')],
      b: [lp('Waiting for the End', '5qF_qbaWt3Q'), lp('Burn It Down', 'dxytyRy-O1k'), lp('Castle of Glass', 'ScNNfyq3d_w'), lp('The Emptiness Machine', 'SRXH9AbT280')],
    },
    source: 'youtube',
  },
  {
    id: 'drive',
    title: 'Long drive',
    note: 'Rock classics',
    label: '#9db6ff', ink: '#0b1238', stripes: ['#0b1238', '#f1ede2'], shell: '#1d2a6b',
    side: {
      a: [
        { title: 'Back in Black', artist: 'AC/DC', id: 'pAgnJDJN4VA' },
        { title: 'Enter Sandman', artist: 'Metallica', id: 'CD-E-LDc384' },
        { title: 'Smells Like Teen Spirit', artist: 'Nirvana', id: 'hTWKbfoikeg' },
        { title: 'Sweet Child O’ Mine', artist: 'Guns N’ Roses', id: '1w7OgIMMRc4' },
      ],
      b: [
        { title: 'Bohemian Rhapsody', artist: 'Queen', id: 'fJ9rUzIMcZQ' },
        { title: 'Seven Nation Army', artist: 'The White Stripes', id: '0J2QdDbelmY' },
        { title: 'Everlong', artist: 'Foo Fighters', id: 'eBG7P-K-r1Y' },
        { title: 'Paranoid', artist: 'Black Sabbath', id: '0qanF-91aJo' },
      ],
    },
    source: 'youtube',
  },
  {
    id: 'line',
    title: 'Line idle',
    note: 'The site’s own tones',
    label: '#0b0e1a', ink: '#9db6ff', stripes: ['#2447d8', '#4d74ff', '#9db6ff'], shell: '#0a0a0f',
    side: {
      a: [{ title: 'KP · 2 · 6 · 0 · 0 · ST', artist: 'MF tones' }, { title: 'Seize: 2600 Hz', artist: 'Supervisory tone' }],
      b: [{ title: 'MF digits 1 to 0', artist: 'MF tones' }],
    },
    source: 'tones',
  },
];

export const watchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
