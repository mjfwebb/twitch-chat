import { useState } from 'react';
import { DEFAULT_CHAT_SETTINGS_VALUES } from '../../../constants';
import { ChannelChatMessageEvent } from '../../../types/twitchEvents';
import { buildFilterRegex, decodeFiltersFromUrl, type UserFilterConfig } from '../../../utils/filters';
import { ChatEntry } from '../../Chat/ChatEntry';

import './ChatPreview.less';

const fakeTwitchMessages: ChannelChatMessageEvent['message'][] = [
  {
    text: 'Kappa5000 keep being awesome!',
    fragments: [
      {
        type: 'cheermote',
        text: 'Kappa5000',
        cheermote: {
          prefix: 'kappa',
          bits: 5000,
          tier: 1,
        },
      },
      {
        type: 'text',
        text: ' keep being awesome!',
      },
    ],
  },
  {
    text: 'This is so cool peepoWow',
    fragments: [
      {
        type: 'text',
        text: 'This is so cool peepoWow',
      },
    ],
  },
  {
    text: 'Did you see that? Unbeleafable! haHAA LUL',
    fragments: [
      {
        type: 'text',
        text: 'Did you see that? Unbeleafable! haHAA ',
      },
      {
        type: 'emote',
        text: 'LUL',
        emote: {
          id: '425618',
          emote_set_id: '0',
          owner_id: '0',
          format: ['static'],
        },
      },
    ],
  },
  {
    text: 'Loving the stream, keep it up! Cheer169',
    fragments: [
      {
        type: 'text',
        text: 'Loving the stream, keep it up!',
      },
      {
        type: 'cheermote',
        text: 'Cheer169',
        cheermote: {
          prefix: 'cheer',
          bits: 169,
          tier: 1,
        },
      },
    ],
  },
  {
    text: '!hype Can we get some hype in the chat? catJAM',
    fragments: [
      {
        type: 'text',
        text: '!hype Can we get some hype in the chat? catJAM',
      },
    ],
  },
];

const fakeUsers: {
  name: string;
  login: string;
  color: string;
  avatarUrl: string;
  badges: ChannelChatMessageEvent['badges'];
}[] = [
  { name: 'Alice', login: 'alice', color: '#ff5733', avatarUrl: 'https://i.pravatar.cc/256?img=10', badges: [] },
  { name: 'Bob', login: 'bob', color: '#33ff57', avatarUrl: 'https://i.pravatar.cc/256?img=15', badges: [] },
  {
    name: 'Charlie',
    login: 'charlie',
    color: '#3357ff',
    avatarUrl: 'https://i.pravatar.cc/256?img=11',
    badges: [
      {
        set_id: 'subscriber',
        id: '1',
        info: '12',
      },
    ],
  },
  {
    name: 'Diana',
    login: 'diana',
    color: '#f333ff',
    avatarUrl: 'https://i.pravatar.cc/256?img=28',
    badges: [
      {
        set_id: 'subscriber',
        id: '1',
        info: '',
      },
    ],
  },
  { name: '안녕하세요', login: 'Eve', color: '#33fff5', avatarUrl: 'https://i.pravatar.cc/256?img=21', badges: [] },
];

export const ChatPreview = ({ overlayParameters }: { overlayParameters: typeof DEFAULT_CHAT_SETTINGS_VALUES }) => {
  const overlayParametersToChatEntryProps = {
    foregroundColor: overlayParameters.foregroundColor,
    backgroundColor: overlayParameters.backgroundColor,
    fontFamily: overlayParameters.fontFamily,
    fontSize: `${overlayParameters.fontSizeValue}${overlayParameters.fontSizeUnit}`,
    width: `${overlayParameters.widthValue}${overlayParameters.widthUnit}`,
    height: `${overlayParameters.heightValue}${overlayParameters.heightUnit}`,
    animatedEntry: overlayParameters.animatedEntry,
    animatedExit: overlayParameters.animatedExit,
    secondsBeforeExit: overlayParameters.secondsBeforeExit,
    showAvatars: overlayParameters.showAvatars,
    showBorders: overlayParameters.showBorders,
    showColonAfterDisplayName: overlayParameters.showColonAfterDisplayName,
    showNameAlias: overlayParameters.showNameAlias,
    dropShadowEnabled: overlayParameters.dropShadowEnabled,
    dropShadowSettings: overlayParameters.dropShadowSettings,
    textStrokeEnabled: overlayParameters.textStrokeEnabled,
    textStrokeSettings: overlayParameters.textStrokeSettings,
    chatMessagePadding: `${overlayParameters.chatMessagePaddingValue}${overlayParameters.chatMessagePaddingUnit}`,
  };
  const [backgroundColor, setBackgroundColor] = useState('#202c51');

  const generateNewBackgroundColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0');
    setBackgroundColor(`#${randomColor}`);
  };

  const fakeChatMessageEvents = Array.from({ length: 5 }, (_, idx: number) => {
    {
      const user = fakeUsers[idx];

      return {
        broadcaster_user_id: '0',
        broadcaster_user_login: 'athano',
        broadcaster_user_name: 'Athano',
        chatter_user_id: '0',
        chatter_user_login: user.login,
        chatter_user_name: user.name,
        message_id: String(idx),
        message: fakeTwitchMessages[idx],
        message_type: 'text',
        badges: fakeUsers[idx].badges,
        color: user.color,
        eventType: 'channel.chat.message',
      } satisfies ChannelChatMessageEvent;
    }
  });

  // Apply username filter if provided in overlayParameters.usernameFilters
  const previewUsernameFilterCfg: UserFilterConfig | null = overlayParameters.usernameFilters
    ? decodeFiltersFromUrl(overlayParameters.usernameFilters)
    : null;
  const usernameFilterRegex = previewUsernameFilterCfg ? buildFilterRegex(previewUsernameFilterCfg) : null;

  // Apply message filter if provided in overlayParameters.messageFilters
  const previewMessageFilterCfg: UserFilterConfig | null = overlayParameters.messageFilters
    ? decodeFiltersFromUrl(overlayParameters.messageFilters)
    : null;
  const messageFilterRegex = previewMessageFilterCfg ? buildFilterRegex(previewMessageFilterCfg) : null;

  const filteredMessages = fakeChatMessageEvents.filter((m) => {
    if (!usernameFilterRegex && !messageFilterRegex) {
      return true;
    }

    const userOk = usernameFilterRegex ? usernameFilterRegex.test(m.chatter_user_name) : true;
    const msgOk = messageFilterRegex ? messageFilterRegex.test(m.message.text) : true;

    return userOk && msgOk;
  });

  return (
    <div className="chat-preview-container">
      <h2>Overlay preview</h2>
      <div className="chat-preview" style={{ backgroundColor }}>
        <button className="chat-preview-change-bg-button" onClick={generateNewBackgroundColor}>
          Change background color
        </button>
        <div
          style={{
            background: overlayParametersToChatEntryProps.backgroundColor,
            width: overlayParametersToChatEntryProps.width,
            color: overlayParametersToChatEntryProps.foregroundColor,
            fontSize: overlayParametersToChatEntryProps.fontSize,
            fontFamily: overlayParametersToChatEntryProps.fontFamily,
          }}
        >
          {filteredMessages.map((fakeChatMessageEvent) => (
            <ChatEntry
              key={fakeChatMessageEvent.message_id}
              {...overlayParametersToChatEntryProps}
              chatMessage={fakeChatMessageEvent}
              userInformationStore={{
                [fakeChatMessageEvent.chatter_user_id]: {
                  profile_image_url: fakeUsers.find((u) => u.name === fakeChatMessageEvent.chatter_user_name)?.avatarUrl,
                },
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
