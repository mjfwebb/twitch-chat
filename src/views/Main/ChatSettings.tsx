import { useState } from 'react';

import { DEFAULT_CHAT_SETTINGS_VALUES } from '../../constants';
import './ChatSettings.less';
import { ColorPicker } from './ColorPicker';

export const ChatSettings = ({ chatUrl, setChatUrl }: { chatUrl: string; setChatUrl: (url: string) => void }) => {
  const [overlayParameters, setOverlayParameters] = useState(DEFAULT_CHAT_SETTINGS_VALUES);
  const [loadSettingsError, setLoadSettingsError] = useState('');
  const [loadingUrl, setLoadingUrl] = useState('');

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
  };

  const handleLoadUrl = () => {
    setLoadSettingsError('');
    if (!loadingUrl) return;
    try {
      const url = new URL(loadingUrl);
      for (const [key, defaultValue] of Object.entries(DEFAULT_CHAT_SETTINGS_VALUES)) {
        const value = url.searchParams.get(key) || defaultValue;
        console.log(`Loaded ${key}: ${value}`);
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
    <details className="chat-settings">
      <summary>Customise look and feel of the overlay</summary>
      <section className="chat-settings-load-from-url">
        <label htmlFor="chat-url">If you already have a URL and want to update it, enter it here so we can get the settings:</label>
        <input id="chat-url" type="text" onChange={handleChatUrlChange} />
        <button onClick={() => handleLoadUrl()} className="button button-secondary">
          Load settings from URL
        </button>
        {loadSettingsError && <p className="error">{loadSettingsError}</p>}
      </section>
      <span>Colors:</span>
      <section>
        <label htmlFor="foreground-color">Foreground Color:</label>
        <ColorPicker
          id="foreground-color"
          placeholder="#ffffff"
          value={overlayParameters.foregroundColor}
          onChange={(newColor) => setOverlayParameters((prev) => ({ ...prev, foregroundColor: newColor }))}
          setToDefault={() => setOverlayParameters((prev) => ({ ...prev, foregroundColor: DEFAULT_CHAT_SETTINGS_VALUES.foregroundColor }))}
        />
        <label htmlFor="background-color">Background Color:</label>
        <ColorPicker
          id="background-color"
          placeholder="#000000"
          value={overlayParameters.backgroundColor}
          onChange={(newColor) => setOverlayParameters((prev) => ({ ...prev, backgroundColor: newColor }))}
          setToDefault={() => setOverlayParameters((prev) => ({ ...prev, backgroundColor: DEFAULT_CHAT_SETTINGS_VALUES.backgroundColor }))}
        />
      </section>
      <span>Font:</span>
      <section>
        <label htmlFor="font-family">Font Family:</label>
        <input
          id="font-family"
          type="text"
          placeholder="Arial"
          value={overlayParameters.fontFamily}
          onChange={(e) => setOverlayParameters((prev) => ({ ...prev, fontFamily: e.target.value }))}
        />
        <label htmlFor="font-size-value">Font Size:</label>
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
      </section>
      <span>Dimensions:</span>
      <section>
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
      </section>
      <span>Animation</span>
      <section>
        <div className="chat-settings-animation-inputs">
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
      <button className="button button-primary" onClick={handleUpdateUrl}>
        Update Chat URL
      </button>
    </details>
  );
};
