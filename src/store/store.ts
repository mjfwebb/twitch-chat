import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserInformation } from '../handlers/twitch/helix/schemas';
import { ChannelChatMessageDeleteEvent, ChannelChatMessageEvent } from '../types/twitchEvents';
import { ChatBadge, ChatCheer, ChatEmote } from '../types/types';

interface StoreState {
  clientId: string;
  broadcasterId: string | null;
  chatBadges: Record<string, ChatBadge>;
  chatCheers: Record<string, ChatCheer>;
  chatEmotes: Record<string, ChatEmote>;
  chatMessageEvents: ChannelChatMessageEvent[];
  userInformation: Record<string, UserInformation>;
  addChatMessage: (event: ChannelChatMessageEvent) => void;
  addUserInformation: (userInfo: UserInformation) => void;
  deleteChatMessage: (event: ChannelChatMessageDeleteEvent) => void;
  removeChatMessage: (event: ChannelChatMessageEvent) => void;
  removeChatEmote: (emoteId: string) => void;
  setBroadcasterId: (id: string | null) => void;
  setChatBadges: (badges: Record<string, ChatBadge>) => void;
  setChatCheers: (cheers: Record<string, ChatCheer>) => void;
  setChatEmotes: (emotes: Record<string, ChatEmote>) => void;
}

export const store = create<StoreState>((set) => ({
  accessToken: null,
  broadcasterId: null,
  chatBadges: {},
  chatCheers: {},
  chatEmotes: {},
  clientId: 'nl4u7l1h4dt48e8hj58yha0we527kg',
  chatMessageEvents: [],
  userInformation: {},
  addUserInformation: (userInfo: UserInformation) => {
    set((state) => ({
      userInformation: {
        ...state.userInformation,
        [userInfo.id]: userInfo,
      },
    }));
  },
  addChatMessage: (chatMessage: ChannelChatMessageEvent) => {
    set((state) => ({
      ...state,
      chatMessageEvents: [...state.chatMessageEvents, chatMessage],
    }));
  },
  deleteChatMessage: (chatMessage: ChannelChatMessageDeleteEvent) => {
    set((state) => ({
      ...state,
      chatMessageEvents: state.chatMessageEvents.filter((message) => message.message_id !== chatMessage.message_id),
    }));
  },
  removeChatMessage: (chatMessage: ChannelChatMessageEvent) => {
    set((state) => ({
      ...state,
      chatMessageEvents: state.chatMessageEvents.filter((message) => message.message_id !== chatMessage.message_id),
    }));
  },
  removeChatEmote: (emoteId: string) => {
    set((state) => ({
      chatEmotes: Object.fromEntries(Object.entries(state.chatEmotes).filter(([, emote]) => emote.id !== emoteId)),
    }));
  },
  setBroadcasterId: (id: string | null) => set({ broadcasterId: id }),
  setChatCheers: (cheers: Record<string, ChatCheer>) => set((state) => ({ chatCheers: { ...state.chatCheers, ...cheers } })),
  setChatBadges: (badges: Record<string, ChatBadge>) => set((state) => ({ chatBadges: { ...state.chatBadges, ...badges } })),
  setChatEmotes: (emotes: Record<string, ChatEmote>) => set((state) => ({ chatEmotes: { ...state.chatEmotes, ...emotes } })),
}));

interface PersistedStoreState {
  accessToken: string;
  authStateValue: string;
  frankerFaceZEnabled: boolean;
  betterTTVEnabled: boolean;
  sevenTVEnabled: boolean;
  setFrankerFaceZEnabled: (enabled: boolean) => void;
  setBetterTTVEnabled: (enabled: boolean) => void;
  setSevenTVEnabled: (enabled: boolean) => void;
  setAuthStateValue: (newAuthStateValue: string) => void;
  getAccessToken: () => string;
  setAccessToken: (token: string) => void;
}

export const persistedStore = create<PersistedStoreState>()(
  persist(
    (set) => ({
      accessToken: '',
      authStateValue: '',
      frankerFaceZEnabled: true,
      betterTTVEnabled: true,
      sevenTVEnabled: true,
      setFrankerFaceZEnabled: (enabled: boolean) => set({ frankerFaceZEnabled: enabled }),
      setBetterTTVEnabled: (enabled: boolean) => set({ betterTTVEnabled: enabled }),
      setSevenTVEnabled: (enabled: boolean) => set({ sevenTVEnabled: enabled }),
      setAuthStateValue: (newAuthStateValue: string) => set({ authStateValue: newAuthStateValue }),
      setAccessToken: (token: string) => set({ accessToken: token }),
      getAccessToken: (): string => {
        const at = persistedStore.getState().accessToken;
        if (!at) {
          throw new Error('Access token is not set.');
        }
        return at;
      },
    }),
    {
      name: 'athano-chat-overlay', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
    },
  ),
);
