import { useRef, useState } from 'react';

import { DEFAULT_CHAT_SETTINGS_VALUES } from '../../constants';
import { ChannelChatMessageEvent } from '../../types/twitchEvents';
import { ChatEntry } from '../Chat/ChatEntry';
import './ChatSettings.less';
import { ColorPicker } from './ColorPicker';

const fakesTwitchMessages = [
  'Pog Thats awesome!',
  'This is so cool peepoWow',
  'Did you see that? Unbeleafable! haHAA',
  'Loving the stream, keep it up!',
  'Can we get some hype in the chat? catJAM',
];

const fakeUsers: {
  name: string;
  color: string;
  avatarUrl: string;
}[] = [
  { name: 'Alice', color: '#ff5733', avatarUrl: 'https://i.pravatar.cc/256?img=10' },
  { name: 'Bob', color: '#33ff57', avatarUrl: 'https://i.pravatar.cc/256?img=15' },
  { name: 'Charlie', color: '#3357ff', avatarUrl: 'https://i.pravatar.cc/256?img=11' },
  { name: 'Diana', color: '#f333ff', avatarUrl: 'https://i.pravatar.cc/256?img=28' },
  { name: 'Eve', color: '#33fff5', avatarUrl: 'https://i.pravatar.cc/256?img=21' },
];

const ChatPreview = ({ overlayParameters }: { overlayParameters: typeof DEFAULT_CHAT_SETTINGS_VALUES }) => {
  const overlayParametersToChatEntryProps = {
    foregroundColor: overlayParameters.foregroundColor,
    backgroundColor: overlayParameters.backgroundColor,
    fontFamily: overlayParameters.fontFamily,
    fontSize: `${overlayParameters.fontSizeValue}${overlayParameters.fontSizeUnit}`,
    width: `${overlayParameters.widthSizeValue}${overlayParameters.widthSizeUnit}`,
    height: `${overlayParameters.heightSizeValue}${overlayParameters.heightSizeUnit}`,
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
        chatter_user_login: user.name.toLowerCase(),
        chatter_user_name: user.name,
        message_id: String(Math.floor(Math.random() * 10000)),
        message: chatMessage,
        message_type: 'text',
        badges: [],
        color: user.color,
        eventType: 'channel.chat.message',
      } satisfies ChannelChatMessageEvent;
    }
  });

  return (
    <div className="chat-preview-container">
      <h2>Overlay preview</h2>
      <div className="chat-preview">
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

export const ChatSettings = ({ chatUrl, setChatUrl }: { chatUrl: string; setChatUrl: (url: string) => void }) => {
  const [overlayParameters, setOverlayParameters] = useState(DEFAULT_CHAT_SETTINGS_VALUES);
  const [loadSettingsError, setLoadSettingsError] = useState('');
  const [loadingUrl, setLoadingUrl] = useState('');
  const detailsRef = useRef<HTMLDetailsElement>(null);

  console.log('Overlay parameters animatedEntry', overlayParameters.animatedEntry);

  const handleUpdateUrl = () => {
    const url = new URL(chatUrl);
    Object.entries(overlayParameters).forEach(([key, value]) => {
      // If the value is the default value, either remove the key from the chatURL, or just don't add it in the first place
      const defaultValue = DEFAULT_CHAT_SETTINGS_VALUES[key as keyof typeof DEFAULT_CHAT_SETTINGS_VALUES];
      if (value !== defaultValue) {
        console.log(`Setting ${key} to ${value} (default is ${defaultValue})`);
        url.searchParams.set(key, String(value));
      } else {
        url.searchParams.delete(key);
      }
    });
    setChatUrl(url.toString());
    detailsRef.current?.removeAttribute('open');
    detailsRef.current?.scrollIntoView();
  };

  const handleLoadUrl = () => {
    setLoadSettingsError('');
    if (!loadingUrl) return;
    try {
      const url = new URL(loadingUrl);
      for (const [key, defaultValue] of Object.entries(DEFAULT_CHAT_SETTINGS_VALUES)) {
        const value = url.searchParams.get(key) ?? defaultValue;
        // console.log(`Loaded ${key}: ${value}`);
        setOverlayParameters((prev) => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      setLoadSettingsError(`Are you sure you put that in properly? (${(error as Error).message})`);
    }
  };

  const handleChatUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoadSettingsError('');
    setLoadingUrl(event.target.value);
  };

  return (
    <div>
      <ChatPreview overlayParameters={overlayParameters} />
      <details className="chat-settings" ref={detailsRef}>
        <summary>👉 Customise look and feel of the overlay</summary>
        <section>
          <h3>Load settings from URL</h3>
          <div className="chat-settings-section chat-settings-load-from-url">
            <label htmlFor="chat-url">If you already have a URL and want to update it, enter it here so we can get the settings:</label>
            <input id="chat-url" type="text" onChange={handleChatUrlChange} placeholder="Your source URL here" />
            <button onClick={() => handleLoadUrl()} className="button button-secondary">
              Load settings from URL
            </button>
            {loadSettingsError && <p className="error">{loadSettingsError}</p>}
          </div>
        </section>
        <section>
          <h3>Colors</h3>
          <div className="chat-settings-section">
            <label htmlFor="foreground-color">Text color:</label>
            <ColorPicker
              id="foreground-color"
              placeholder="#ffffff"
              value={overlayParameters.foregroundColor}
              onChange={(newColor) => setOverlayParameters((prev) => ({ ...prev, foregroundColor: newColor }))}
              setToDefault={() => setOverlayParameters((prev) => ({ ...prev, foregroundColor: DEFAULT_CHAT_SETTINGS_VALUES.foregroundColor }))}
            />
            <label htmlFor="background-color">Background color:</label>
            <ColorPicker
              id="background-color"
              placeholder="#000000"
              value={overlayParameters.backgroundColor}
              onChange={(newColor) => setOverlayParameters((prev) => ({ ...prev, backgroundColor: newColor }))}
              setToDefault={() => setOverlayParameters((prev) => ({ ...prev, backgroundColor: DEFAULT_CHAT_SETTINGS_VALUES.backgroundColor }))}
            />
          </div>
        </section>
        <section>
          <h3>Font</h3>
          <div className="chat-settings-section">
            <label htmlFor="font-family">Font family:</label>
            <input
              id="font-family"
              type="text"
              placeholder="Arial"
              value={overlayParameters.fontFamily}
              onChange={(e) => setOverlayParameters((prev) => ({ ...prev, fontFamily: e.target.value }))}
            />
            <label htmlFor="font-size-value">Font size:</label>
            <div className="chat-settings-size-inputs">
              <input
                id="font-size-value"
                type="text"
                placeholder="18px"
                value={overlayParameters.fontSizeValue}
                onChange={(e) =>
                  setOverlayParameters((prev) => {
                    if (!isNaN(Number(e.target.value))) {
                      return { ...prev, fontSizeValue: Number(e.target.value) };
                    }
                    return prev;
                  })
                }
                autoComplete="off"
              />
              <select
                id="font-size-unit"
                value={overlayParameters.fontSizeUnit}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, fontSizeUnit: e.target.value }))}
                autoComplete="off"
                defaultValue={DEFAULT_CHAT_SETTINGS_VALUES.fontSizeUnit}
              >
                <option value="px">px</option>
                <option value="em">em</option>
                <option value="rem">rem</option>
              </select>
            </div>
          </div>
        </section>
        <section>
          <h3>Dimensions</h3>
          <div className="chat-settings-section">
            <p className="info">Set the width and height to match the browser source width and height so you get a perfect resolution match</p>
            <label htmlFor="width">Overlay width:</label>
            <div className="chat-settings-size-inputs">
              <input
                id="width-size-value"
                type="text"
                placeholder={String(DEFAULT_CHAT_SETTINGS_VALUES.widthSizeValue)}
                value={overlayParameters.widthSizeValue}
                onChange={(e) =>
                  setOverlayParameters((prev) => {
                    if (!isNaN(Number(e.target.value))) {
                      return { ...prev, widthSizeValue: Number(e.target.value) };
                    }
                    return prev;
                  })
                }
                autoComplete="off"
              />
              <select
                id="width-size-unit"
                value={overlayParameters.widthSizeUnit}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, widthSizeUnit: e.target.value }))}
                autoComplete="off"
                defaultValue={DEFAULT_CHAT_SETTINGS_VALUES.widthSizeUnit}
              >
                <option value="px">px</option>
                <option value="em">em</option>
                <option value="rem">rem</option>
                <option value="vw">vw</option>
              </select>
            </div>

            <label htmlFor="chat-height">Overlay height:</label>
            <div className="chat-settings-size-inputs">
              <input
                id="height-size-value"
                type="text"
                placeholder={String(DEFAULT_CHAT_SETTINGS_VALUES.heightSizeValue)}
                value={overlayParameters.heightSizeValue}
                onChange={(e) =>
                  setOverlayParameters((prev) => {
                    if (!isNaN(Number(e.target.value))) {
                      return { ...prev, heightSizeValue: Number(e.target.value) };
                    }
                    return prev;
                  })
                }
                autoComplete="off"
              />
              <select
                id="height-size-unit"
                value={overlayParameters.heightSizeUnit}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, heightSizeUnit: e.target.value }))}
                autoComplete="off"
                defaultValue={DEFAULT_CHAT_SETTINGS_VALUES.heightSizeUnit}
              >
                <option value="px">px</option>
                <option value="em">em</option>
                <option value="rem">rem</option>
                <option value="vh">vh</option>
              </select>
            </div>
          </div>
        </section>
        <section>
          <h3>Animation</h3>
          <div className="chat-settings-section">
            <label htmlFor="animatedEntry">Animated entry:</label>
            <p>
              <small>Enable this to have the chat overlay fade in when it appears.</small>
            </p>
            <input
              type="checkbox"
              id="animatedEntry"
              checked={overlayParameters.animatedEntry}
              onChange={(e) => setOverlayParameters((prev) => ({ ...prev, animatedEntry: e.target.checked }))}
            />
          </div>
          <div className="chat-settings-section">
            <label htmlFor="animatedExit">Animated exit:</label>
            <p>
              <small>Enable this to have the chat overlay fade out when it disappears.</small>
            </p>
            <input
              type="checkbox"
              id="animatedExit"
              checked={overlayParameters.animatedExit}
              onChange={(e) => setOverlayParameters((prev) => ({ ...prev, animatedExit: e.target.checked }))}
            />
          </div>
          <div className="chat-settings-section">
            <label htmlFor="secondsBeforeExit">Seconds before exit:</label>
            <p>
              <small>Set the number of seconds before the chat overlay exits. Only applies if animated exit is enabled.</small>
            </p>
            <input
              id="secondsBeforeExit"
              type="number"
              value={overlayParameters.secondsBeforeExit}
              onChange={(e) =>
                setOverlayParameters((prev) => ({
                  ...prev,
                  secondsBeforeExit: Number(e.target.value),
                }))
              }
            />
          </div>
        </section>
        <button className="button button-primary button-update-chat" onClick={handleUpdateUrl}>
          Update Chat URL
        </button>
      </details>
    </div>
  );
};
