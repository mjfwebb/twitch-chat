import { useEffect, useRef, useState } from 'react';

import { chatSearchParamsMap, DEFAULT_CHAT_SETTINGS_VALUES } from '../../constants';
import { useDebounce } from '../../hooks/useDebounce';
import { ChatPreview } from './ChatPreview';
import './ChatSettings.less';
import { ColorPicker } from './ColorPicker';
import { ConfirmModal } from './ConfirmModal';
import { TextShadowStacker } from './TextShadowPicker/TextShadowStacker';

const multiPartSettingsMap = {
  'font-size': ['fontSizeValue', 'fontSizeUnit'],
  width: ['widthValue', 'widthUnit'],
  height: ['heightValue', 'heightUnit'],
  'chat-message-padding': ['chatMessagePaddingValue', 'chatMessagePaddingUnit'],
};

const multiPartRegex = /^(?<value>[\d.]+)(?<unit>px|em|rem|vh|vw|ch)$/;

export const ChatSettings = ({ chatUrl, setChatUrl }: { chatUrl: string; setChatUrl: (url: string) => void }) => {
  const [overlayParameters, setOverlayParameters] = useState(DEFAULT_CHAT_SETTINGS_VALUES);
  const [loadSettingsError, setLoadSettingsError] = useState('');
  const [loadingUrl, setLoadingUrl] = useState('');
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const [dropShadowSettings, setDropShadowSettings] = useState(overlayParameters.dropShadowSettings);
  const debouncedDropShadowSettings = useDebounce(dropShadowSettings, 300);

  useEffect(() => {
    setOverlayParameters((prev) => ({
      ...prev,
      dropShadowSettings: debouncedDropShadowSettings,
    }));
  }, [debouncedDropShadowSettings]);

  const handleUpdateUrl = () => {
    const url = new URL(chatUrl);
    Object.entries(overlayParameters).forEach(([key, value]) => {
      // If the value is the default value, either remove the key from the chatURL, or just don't add it in the first place
      const defaultValue = DEFAULT_CHAT_SETTINGS_VALUES[key as keyof typeof DEFAULT_CHAT_SETTINGS_VALUES];
      const param = chatSearchParamsMap[key as keyof typeof chatSearchParamsMap];
      if (value !== defaultValue) {
        console.log(`Setting ${key} to ${value} (default is ${defaultValue})`);
        url.searchParams.set(param, String(value));
      } else {
        url.searchParams.delete(param);
      }
    });
    setChatUrl(url.toString());
    detailsRef.current?.removeAttribute('open');
    detailsRef.current?.scrollIntoView();
  };

  const setParametersToDefault = () => {
    setDropShadowSettings(DEFAULT_CHAT_SETTINGS_VALUES.dropShadowSettings);
    setOverlayParameters(DEFAULT_CHAT_SETTINGS_VALUES);
    // Keep local shadow state in sync with defaults
  };

  const openConfirmReset = () => setConfirmResetOpen(true);
  const cancelConfirmReset = () => setConfirmResetOpen(false);
  const confirmReset = () => {
    setParametersToDefault();

    setConfirmResetOpen(false);
  };

  const handleLoadUrl = () => {
    setLoadSettingsError('');
    if (!loadingUrl) {
      return;
    }
    try {
      const url = new URL(loadingUrl);

      // Set all values to defaults to normalize
      setParametersToDefault();

      // Now load the chat settings from the URL
      for (const [key, urlParam] of Object.entries(chatSearchParamsMap)) {
        const value = url.searchParams.get(urlParam) ?? DEFAULT_CHAT_SETTINGS_VALUES[key as keyof typeof DEFAULT_CHAT_SETTINGS_VALUES];

        // Special-case: stacked text-shadows (comma-separated)
        if (key === 'dropShadowSettings') {
          const shadowValue = url.searchParams.get(urlParam);
          if (shadowValue != null) {
            // Assign decoded, comma-separated shadow string to local and overlay state
            setDropShadowSettings(shadowValue);
            setOverlayParameters((prev) => ({ ...prev, dropShadowSettings: shadowValue }));
          }
          continue;
        }

        if (Object.keys(multiPartSettingsMap).includes(urlParam)) {
          const match = String(value).match(multiPartRegex);
          if (match) {
            const sizeValue = Number(match.groups?.value);
            const sizeUnit = match.groups?.unit;
            setOverlayParameters((prev) => ({
              ...prev,
              [multiPartSettingsMap[urlParam as keyof typeof multiPartSettingsMap][0]]: sizeValue,
              [multiPartSettingsMap[urlParam as keyof typeof multiPartSettingsMap][1]]: sizeUnit,
            }));
            continue;
          }
        }

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
    <div>
      <ChatPreview overlayParameters={{ ...overlayParameters, dropShadowSettings }} />
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
          <h3>Reset to default settings</h3>
          <div className="chat-settings-section chat-settings-reset">
            <p>This will reset all settings to their default values.</p>
            <button onClick={openConfirmReset} className="button button-secondary">
              Reset to default settings
            </button>
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
            <button
              className="button button-secondary"
              onClick={() =>
                setOverlayParameters((prev) => ({
                  ...prev,
                  fontSizeValue: DEFAULT_CHAT_SETTINGS_VALUES.fontSizeValue,
                  fontSizeUnit: DEFAULT_CHAT_SETTINGS_VALUES.fontSizeUnit,
                }))
              }
            >
              Reset to defaults
            </button>
          </div>
        </section>
        <section>
          <h3>Dimensions</h3>
          <div className="chat-settings-section">
            <p className="info">Set the width and height to match the browser source width and height so you get a perfect resolution match</p>
            <label htmlFor="width-value">Overlay width:</label>
            <div className="chat-settings-size-inputs">
              <input
                id="width-value"
                type="text"
                placeholder={String(DEFAULT_CHAT_SETTINGS_VALUES.widthValue)}
                value={overlayParameters.widthValue}
                onChange={(e) =>
                  setOverlayParameters((prev) => {
                    if (!isNaN(Number(e.target.value))) {
                      return { ...prev, widthValue: Number(e.target.value) };
                    }
                    return prev;
                  })
                }
                autoComplete="off"
              />
              <select
                id="width-unit"
                value={overlayParameters.widthUnit}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, widthUnit: e.target.value }))}
                autoComplete="off"
                defaultValue={DEFAULT_CHAT_SETTINGS_VALUES.widthUnit}
              >
                <option value="px">px</option>
                <option value="em">em</option>
                <option value="rem">rem</option>
                <option value="vw">vw</option>
              </select>
              <button
                className="button button-secondary"
                onClick={() =>
                  setOverlayParameters((prev) => ({
                    ...prev,
                    widthValue: DEFAULT_CHAT_SETTINGS_VALUES.widthValue,
                    widthUnit: DEFAULT_CHAT_SETTINGS_VALUES.widthUnit,
                  }))
                }
              >
                Reset to defaults
              </button>
            </div>
            <label htmlFor="height-value">Overlay height:</label>
            <div className="chat-settings-size-inputs">
              <input
                id="height-value"
                type="text"
                placeholder={String(DEFAULT_CHAT_SETTINGS_VALUES.heightValue)}
                value={overlayParameters.heightValue}
                onChange={(e) =>
                  setOverlayParameters((prev) => {
                    if (!isNaN(Number(e.target.value))) {
                      return { ...prev, heightValue: Number(e.target.value) };
                    }
                    return prev;
                  })
                }
                autoComplete="off"
              />
              <select
                id="height-unit"
                value={overlayParameters.heightUnit}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, heightUnit: e.target.value }))}
                autoComplete="off"
                defaultValue={DEFAULT_CHAT_SETTINGS_VALUES.heightUnit}
              >
                <option value="px">px</option>
                <option value="em">em</option>
                <option value="rem">rem</option>
                <option value="vh">vh</option>
              </select>
              <button
                className="button button-secondary"
                onClick={() =>
                  setOverlayParameters((prev) => ({
                    ...prev,
                    widthValue: DEFAULT_CHAT_SETTINGS_VALUES.widthValue,
                    widthUnit: DEFAULT_CHAT_SETTINGS_VALUES.widthUnit,
                  }))
                }
              >
                Reset to defaults
              </button>
            </div>
          </div>
        </section>
        <section>
          <h3>Avatars</h3>
          <div className="chat-settings-section">
            <label htmlFor="showAvatars">Show avatars:</label>
            <p>
              <small>Enable this to show user avatars in the chat overlay.</small>
            </p>
            <input
              type="checkbox"
              id="showAvatars"
              checked={overlayParameters.showAvatars}
              onChange={(e) => setOverlayParameters((prev) => ({ ...prev, showAvatars: e.target.checked }))}
            />
          </div>
        </section>
        <section>
          <h3>Borders</h3>
          <div className="chat-settings-section">
            <label htmlFor="showBorders">Show borders:</label>
            <p>
              <small>Enable this to show borders around chat messages.</small>
            </p>
            <input
              type="checkbox"
              id="showBorders"
              checked={overlayParameters.showBorders}
              onChange={(e) => setOverlayParameters((prev) => ({ ...prev, showBorders: e.target.checked }))}
            />
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
        <section>
          <h3>Drop shadow</h3>
          <div className="chat-settings-section">
            <label htmlFor="dropShadowEnabled">Drop shadow:</label>
            <p>
              <small>Enable this to add a drop shadow effect to the chat overlay.</small>
            </p>
            <input
              type="checkbox"
              id="dropShadowEnabled"
              checked={overlayParameters.dropShadowEnabled}
              onChange={(e) => setOverlayParameters((prev) => ({ ...prev, dropShadowEnabled: e.target.checked }))}
            />
          </div>
          {overlayParameters.dropShadowEnabled && (
            <TextShadowStacker onChange={(newValue: string) => setDropShadowSettings(newValue)} value={dropShadowSettings} />
          )}
        </section>
        <button className="button button-primary button-update-chat" onClick={handleUpdateUrl}>
          Update Chat URL
        </button>
      </details>
      <ConfirmModal
        open={confirmResetOpen}
        title="Reset settings?"
        message="This will reset all settings to their default values."
        confirmText="Reset"
        cancelText="Cancel"
        onConfirm={confirmReset}
        onCancel={cancelConfirmReset}
      />
    </div>
  );
};
