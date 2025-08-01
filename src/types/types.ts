export type ChatEmote = {
  origin: 'sevenTV' | 'betterTTV' | 'frankerFaceZ' | 'twitch' | 'emoji';
  src: string;
  srcSet?: string;
  width: number | null;
  height: number | null;
  modifier: boolean;
  hidden: boolean;
  modifierFlags: number;
  id: string;
  name: string;
};

export type ChatBadge = {
  name: string;
  url: string;
};

export type ChatCheer = {
  name: string;
  url: string;
  color: string;
  minBits: number;
};
