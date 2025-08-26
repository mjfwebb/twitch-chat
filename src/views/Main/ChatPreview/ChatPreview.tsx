import { useState } from 'react';
import { DEFAULT_CHAT_SETTINGS_VALUES } from '../../../constants';
import { ChannelChatMessageEvent } from '../../../types/twitchEvents';
import { ChatEntry } from '../../Chat/ChatEntry';

import './ChatPreview.less';

const fakesTwitchMessages = [
  'Wow so awesome!',
  'This is so cool peepoWow',
  'Did you see that? Unbeleafable! haHAA',
  'Loving the stream, keep it up!',
  'Can we get some hype in the chat? catJAM',
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
    thickTextShadowEnabled: overlayParameters.thickTextShadowEnabled,
    textStrokeEnabled: overlayParameters.textStrokeEnabled,
    textStrokeSettings: overlayParameters.textStrokeSettings,
    chatMessagePadding: `${overlayParameters.chatMessagePaddingValue}${overlayParameters.chatMessagePaddingUnit}`,
  };
  const [backgroundColor, setBackgroundColor] = useState('#1a4045');

  const generateNewBackgroundColor = () => {
    const randomColor = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, '0');
    setBackgroundColor(`#${randomColor}`);
  };

  const fakeChatMessageEvents = Array.from({ length: 5 }, (_, idx: number) => {
    {
      const user = fakeUsers[idx];
      const message = fakesTwitchMessages[idx];
      const chatMessage: ChannelChatMessageEvent['message'] = {
        text: message,
        fragments: [{ text: message, type: 'text' }],
      };
      return {
        broadcaster_user_id: '0',
        broadcaster_user_login: 'athano',
        broadcaster_user_name: 'Athano',
        chatter_user_id: '0',
        chatter_user_login: user.login,
        chatter_user_name: user.name,
        message_id: String(idx),
        message: chatMessage,
        message_type: 'text',
        badges: fakeUsers[idx].badges,
        color: user.color,
        eventType: 'channel.chat.message',
      } satisfies ChannelChatMessageEvent;
    }
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
          {fakeChatMessageEvents.map((fakeChatMessageEvent) => (
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
