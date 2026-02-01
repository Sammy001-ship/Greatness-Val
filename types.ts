
export enum Vibe {
  ROMANTIC = 'Romantic',
  POETIC = 'Poetic',
  FUNNY = 'Funny',
  ADMIRING = 'Admiring'
}

export interface LoveMessage {
  text: string;
  vibe: Vibe;
}

export interface GeneratedImage {
  url: string;
  prompt: string;
}
