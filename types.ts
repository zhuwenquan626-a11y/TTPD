
export interface Song {
  id: number;
  title: string;
  trackNumber: number;
  isAnthology: boolean;
}

export interface LyricLine {
  original: string;
  translation: string;
  annotation?: string; // Short explanation for tricky lines
  timestamp?: number; // Simulated timestamp in seconds
}

export interface VocabularyItem {
  word: string;
  definition: string;
  contextInSong: string;
}

export interface Connection {
  songTitle: string;
  album: string;
  explanation: string;
}

export interface SongAnalysis {
  background: string;
  mood: string;
  lyrics: LyricLine[];
  vocabulary: VocabularyItem[];
  connections: Connection[];
  error?: string; // To handle UI errors gracefully
}

export const SONG_LIST: Song[] = [
  // Standard Album
  { id: 1, title: "Fortnight (feat. Post Malone)", trackNumber: 1, isAnthology: false },
  { id: 2, title: "The Tortured Poets Department", trackNumber: 2, isAnthology: false },
  { id: 3, title: "My Boy Only Breaks His Favorite Toys", trackNumber: 3, isAnthology: false },
  { id: 4, title: "Down Bad", trackNumber: 4, isAnthology: false },
  { id: 5, title: "So Long, London", trackNumber: 5, isAnthology: false },
  { id: 6, title: "But Daddy I Love Him", trackNumber: 6, isAnthology: false },
  { id: 7, title: "Fresh Out the Slammer", trackNumber: 7, isAnthology: false },
  { id: 8, title: "Florida!!! (feat. Florence + The Machine)", trackNumber: 8, isAnthology: false },
  { id: 9, title: "Guilty as Sin?", trackNumber: 9, isAnthology: false },
  { id: 10, title: "Who's Afraid of Little Old Me?", trackNumber: 10, isAnthology: false },
  { id: 11, title: "I Can Fix Him (No Really I Can)", trackNumber: 11, isAnthology: false },
  { id: 12, title: "loml", trackNumber: 12, isAnthology: false },
  { id: 13, title: "I Can Do It With a Broken Heart", trackNumber: 13, isAnthology: false },
  { id: 14, title: "The Smallest Man Who Ever Lived", trackNumber: 14, isAnthology: false },
  { id: 15, title: "The Alchemy", trackNumber: 15, isAnthology: false },
  { id: 16, title: "Clara Bow", trackNumber: 16, isAnthology: false },
  // The Anthology
  { id: 17, title: "The Black Dog", trackNumber: 17, isAnthology: true },
  { id: 18, title: "imgonnagetyouback", trackNumber: 18, isAnthology: true },
  { id: 19, title: "The Albatross", trackNumber: 19, isAnthology: true },
  { id: 20, title: "Chloe or Sam or Sophia or Marcus", trackNumber: 20, isAnthology: true },
  { id: 21, title: "How Did It End?", trackNumber: 21, isAnthology: true },
  { id: 22, title: "So High School", trackNumber: 22, isAnthology: true },
  { id: 23, title: "I Hate It Here", trackNumber: 23, isAnthology: true },
  { id: 24, title: "thanK you aIMee", trackNumber: 24, isAnthology: true },
  { id: 25, title: "I Look in People's Windows", trackNumber: 25, isAnthology: true },
  { id: 26, title: "The Prophecy", trackNumber: 26, isAnthology: true },
  { id: 27, title: "Cassandra", trackNumber: 27, isAnthology: true },
  { id: 28, title: "Peter", trackNumber: 28, isAnthology: true },
  { id: 29, title: "The Bolter", trackNumber: 29, isAnthology: true },
  { id: 30, title: "Robin", trackNumber: 30, isAnthology: true },
  { id: 31, title: "The Manuscript", trackNumber: 31, isAnthology: true },
];
