import pc from 'picocolors';
import { runBetterTTVWebsocket } from './handlers/bttv/betterTTVWebsocket';
import { fetchBetterTTVGlobalEmotes } from './handlers/bttv/fetchBetterTTVGlobalEmotes';
import { fetchBetterTTVUser } from './handlers/bttv/fetchBetterTTVUser';
import { BttvEmote } from './handlers/bttv/schemas';
import { fetchFrankerFaceZGlobalEmotes } from './handlers/frankerfacez/fetchFrankerFaceZGlobalEmotes';
import { fetchFrankerFaceZRoomEmotes } from './handlers/frankerfacez/fetchFrankerFaceZRoomEmotes';
import { FrankerFaceZEmote } from './handlers/frankerfacez/schemas';
import { fetchSevenTVEmote } from './handlers/sevenTV/fetchSevenTVEmote';
import { fetchSevenTVEmoteSet } from './handlers/sevenTV/fetchSevenTVEmoteSets';
import { fetchSevenTVTwitchUser } from './handlers/sevenTV/fetchSevenTVTwitchUser';
import { SevenTVEmote } from './handlers/sevenTV/schemas';
import { getSevenTVUser, setSevenTVUser } from './handlers/sevenTV/sevenTVUser';
import { runSevenTVWebsocket } from './handlers/sevenTV/sevenTVWebsocket';
import { persistedStore, store } from './store/store';
import { ChatEmote } from './types/types';
import { logger } from './utils/logger';

export const loadEmotes = async (broadcasterId: string) => {
  const frankerFaceZEnabled = persistedStore.getState().frankerFaceZEnabled;
  const betterTTVEnabled = persistedStore.getState().betterTTVEnabled;
  const sevenTVEnabled = persistedStore.getState().sevenTVEnabled;

  if (sevenTVEnabled) {
    const sevenTVUser = await fetchSevenTVTwitchUser(broadcasterId);
    if (sevenTVUser) {
      setSevenTVUser(sevenTVUser);
      logger.info(`${pc.green('[7TV enabled]')} Running 7TV WebSocket client`);
      runSevenTVWebsocket(sevenTVUser);
    }
    await loadSevenTVEmotes();
  }

  if (betterTTVEnabled) {
    await loadBetterTTVUserEmotes(broadcasterId);
    await loadBetterTTVGlobalEmotes();
    runBetterTTVWebsocket();
  }

  if (frankerFaceZEnabled) {
    await loadFrankerFaceZRoomEmotes(broadcasterId);
    await loadFrankerFaceZGlobalEmotes();
  }
};

export const addFrankerFaceZEmote = (emote: FrankerFaceZEmote) => {
  const name = emote.name;
  const imageUrl = emote.urls['1'];

  const frankerFaceZEmotesForClient: Record<string, ChatEmote> = {};
  frankerFaceZEmotesForClient[name] = {
    origin: 'frankerFaceZ',
    src: imageUrl,
    width: emote.width,
    height: emote.height,
    modifier: emote.modifier,
    hidden: emote.hidden,
    modifierFlags: emote.modifier_flags,
    id: String(emote.id),
    name,
  };
  store.getState().setChatEmotes(frankerFaceZEmotesForClient);
};

const loadFrankerFaceZGlobalEmotes = async () => {
  const frankerFaceZGlobalEmotes = await fetchFrankerFaceZGlobalEmotes();
  if (frankerFaceZGlobalEmotes && frankerFaceZGlobalEmotes.sets) {
    const emoteSets = frankerFaceZGlobalEmotes.default_sets;
    for (const emoteSet of emoteSets) {
      const frankerFaceZEmoteSet = frankerFaceZGlobalEmotes.sets[emoteSet];
      if (frankerFaceZEmoteSet) {
        Object.values(frankerFaceZEmoteSet.emoticons || []).forEach((emote) => addFrankerFaceZEmote(emote));
      }
    }
  }
};

const loadFrankerFaceZRoomEmotes = async (broadcasterId: string) => {
  const frankerFaceZRoomEmotes = await fetchFrankerFaceZRoomEmotes(broadcasterId);
  if (frankerFaceZRoomEmotes && frankerFaceZRoomEmotes.sets) {
    for (const emoteSet of Object.values(frankerFaceZRoomEmotes.sets)) {
      Object.values(emoteSet.emoticons || []).forEach((emote) => addFrankerFaceZEmote(emote));
    }
  }
};

export const removeSevenTVEmote = (emoteId: string) => {
  store.getState().removeChatEmote(emoteId);
};

export const addSevenTVEmote = async (emote: SevenTVEmote) => {
  const sevenTVEmotesForClient: Record<string, ChatEmote> = {};
  const name = emote.name;
  // Use the largest emote for that 4K crispiness
  const file = emote.data.host.files.find((file) => file.name === '3x.webp' || file.name === '3x.avif');

  if (file) {
    const imageUrl = `${emote.data.host.url}/${file.name}`;

    sevenTVEmotesForClient[name] = {
      origin: 'sevenTV',
      src: imageUrl,
      width: file.width,
      height: file.height,
      modifier: false,
      hidden: false,
      modifierFlags: emote.data.flags,
      id: emote.id,
      name,
    };
  } else {
    const id = emote.id;

    const emoteData = await fetchSevenTVEmote(id);
    if (!emoteData) {
      logger.error(`Failed to fetch SevenTV emote ${id}`);
      return;
    }
    const file = emoteData.host.files[2];
    const imageUrl = `${emoteData.host.url}/${file.name}`;

    sevenTVEmotesForClient[emoteData.name] = {
      origin: 'sevenTV',
      src: imageUrl,
      width: file.width,
      height: file.height,
      modifier: false,
      hidden: false,
      modifierFlags: emoteData.flags,
      id: emoteData.id,
      name,
    };
  }

  store.getState().setChatEmotes(sevenTVEmotesForClient);
};

const loadSevenTVEmotes = async () => {
  const sevenTVUser = getSevenTVUser();
  if (sevenTVUser) {
    const emoteSets = [sevenTVUser.emote_set.id, 'global'];
    for (const emoteSet of emoteSets) {
      const sevenTVEmoteSet = await fetchSevenTVEmoteSet(emoteSet);
      if (sevenTVEmoteSet) {
        for (const emote of sevenTVEmoteSet.emotes) {
          await addSevenTVEmote(emote);
        }
      }
    }
  }
};

export const removeBetterTTVEmote = (emoteId: string) => {
  const betterTTVEmotesForClient: Record<string, ChatEmote> = {};
  const foundEmote = Object.values(betterTTVEmotesForClient).find((emote) => emote.id === emoteId);
  if (!foundEmote) return;

  delete betterTTVEmotesForClient[foundEmote.name];
};

export const addBetterTTVEmote = (emote: Pick<BttvEmote, 'code' | 'id' | 'imageType'>) => {
  const betterTTVEmotesForClient: Record<string, ChatEmote> = {};
  betterTTVEmotesForClient[emote.code] = {
    origin: 'betterTTV',
    src: `https://cdn.betterttv.net/emote/${emote.id}/2x.${emote.imageType}`,
    width: null,
    height: null,
    modifier: false,
    hidden: false,
    modifierFlags: 0,
    id: emote.id,
    name: emote.code,
  };
  store.getState().setChatEmotes(betterTTVEmotesForClient);
};

const loadBetterTTVUserEmotes = async (broadcasterId: string) => {
  const betterTTVUser = await fetchBetterTTVUser(broadcasterId);
  if (betterTTVUser) {
    betterTTVUser.sharedEmotes.forEach((emote) => addBetterTTVEmote(emote));
  }
};

const loadBetterTTVGlobalEmotes = async () => {
  const betterTTVGlobalEmotes = await fetchBetterTTVGlobalEmotes();
  if (betterTTVGlobalEmotes) {
    betterTTVGlobalEmotes.forEach((emote) => addBetterTTVEmote(emote));
  }
};
