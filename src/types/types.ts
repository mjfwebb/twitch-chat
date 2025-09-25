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
  prefix: string;
  url: string;
  color: string;
  minBits: number;
};

export type ChatCheerWithBits = Exclude<ChatCheer, 'minBits'> & {
  bits: number;
};
