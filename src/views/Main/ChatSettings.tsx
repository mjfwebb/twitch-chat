import { useEffect, useRef, useState } from 'react';

import { Button } from '../../components/Button/Button';
import { ColorPicker } from '../../components/ColorPicker/ColorPicker';
import { Space } from '../../components/Space/Space';
import { useToast } from '../../components/Toast/useToast';
import { chatSearchParamsMap, DEFAULT_CHAT_SETTINGS_VALUES } from '../../constants';
import { useDebounce } from '../../hooks/useDebounce';
import { ChatPreview } from './ChatPreview/ChatPreview';
import './ChatSettings.less';
import { ConfirmModal } from './ConfirmModal';
import { TextShadowStacker } from './TextShadowPicker/TextShadowStacker';
import { TextStrokeEditor } from './TextStrokePicker/TextStrokeEditor';

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
  const [textStrokeSettings, setTextStrokeSettings] = useState(overlayParameters.textStrokeSettings);
  const debouncedTextStrokeSettings = useDebounce(textStrokeSettings, 300);
  const toast = useToast();

  useEffect(() => {
    setOverlayParameters((prev) => ({
      ...prev,
      dropShadowSettings: debouncedDropShadowSettings,
    }));
  }, [debouncedDropShadowSettings]);

  useEffect(() => {
    setOverlayParameters((prev) => ({
      ...prev,
      textStrokeSettings: debouncedTextStrokeSettings,
    }));
  }, [debouncedTextStrokeSettings]);

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

    toast.showToast('Chat settings updated!');
  };

  const setParametersToDefault = () => {
    setDropShadowSettings(DEFAULT_CHAT_SETTINGS_VALUES.dropShadowSettings);
    setTextStrokeSettings(DEFAULT_CHAT_SETTINGS_VALUES.textStrokeSettings);
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

        // Special-case: text stroke (width + color)
        if (key === 'textStrokeSettings') {
          const strokeVal = url.searchParams.get(urlParam);
          if (strokeVal != null) {
            setTextStrokeSettings(strokeVal);
            setOverlayParameters((prev) => ({ ...prev, textStrokeSettings: strokeVal }));
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

        const isBooleanSetting = typeof DEFAULT_CHAT_SETTINGS_VALUES[key as keyof typeof DEFAULT_CHAT_SETTINGS_VALUES] === 'boolean';
        // If the setting is a boolean, convert the string value to a boolean so it can be used correctly
        if (isBooleanSetting) {
          setOverlayParameters((prev) => ({ ...prev, [key]: value === 'true' }));
        } else {
          setOverlayParameters((prev) => ({ ...prev, [key]: value }));
        }
      }
    } catch (error) {
      setLoadSettingsError(`Are you sure you put that in properly? (${(error as Error).message})`);
    }
  };

  const handleChatUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoadSettingsError('');
    setLoadingUrl(event.target.value);
  };

  const applyNiceDropShadowPreset = () => {
    const preset =
      'rgb(0, 0, 0) 2px 0px 0px, rgb(0, 0, 0) 1.75517px 0.958851px 0px, rgb(0, 0, 0) 1.0806px 1.68294px 0px, rgb(0, 0, 0) 0.141474px 1.99499px 0px, rgb(0, 0, 0) -0.832294px 1.81859px 0px, rgb(0, 0, 0) -1.60229px 1.19694px 0px, rgb(0, 0, 0) -1.97998px 0.28224px 0px, rgb(0, 0, 0) -1.87291px -0.701566px 0px, rgb(0, 0, 0) -1.30729px -1.5136px 0px, rgb(0, 0, 0) -0.421592px -1.95506px 0px, rgb(0, 0, 0) 0.567324px -1.91785px 0px, rgb(0, 0, 0) 1.41734px -1.41108px 0px, rgb(0, 0, 0) 1.92034px -0.558831px 0px';
    setDropShadowSettings(preset);
    setOverlayParameters((prev) => ({ ...prev, dropShadowEnabled: true }));
  };

  return (
    <div>
      <ChatPreview overlayParameters={{ ...overlayParameters, dropShadowSettings, textStrokeSettings }} />
      <details className="chat-settings" ref={detailsRef}>
        <summary>👉 Customise look and feel of the overlay</summary>
        <section>
          <h3>Load settings from URL</h3>
          <div className="chat-settings-section chat-settings-load-from-url">
            <label htmlFor="chat-url">👀 If you already have a URL and want to update it, enter it here so we can get the settings:</label>
            <input id="chat-url" type="text" onChange={handleChatUrlChange} placeholder="Your source URL here" />
            <Button onClick={() => handleLoadUrl()} type="secondary">
              Load settings from URL
            </Button>
            {loadSettingsError && <p className="error">{loadSettingsError}</p>}
          </div>
        </section>
        <section>
          <h3>Reset to default settings</h3>
          <div className="chat-settings-section chat-settings-reset">
            <p>This will reset all settings to their default values.</p>
            <Button onClick={openConfirmReset} type="secondary">
              Reset to default settings
            </Button>
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
            <Button
              type="secondary"
              onClick={() =>
                setOverlayParameters((prev) => ({
                  ...prev,
                  fontSizeValue: DEFAULT_CHAT_SETTINGS_VALUES.fontSizeValue,
                  fontSizeUnit: DEFAULT_CHAT_SETTINGS_VALUES.fontSizeUnit,
                }))
              }
            >
              Reset to defaults
            </Button>
          </div>
        </section>
        <section>
          <h3>Dimensions</h3>
          <div className="chat-settings-section">
            <p className="info">ℹ️ Set the width and height to match the browser source width and height so you get a perfect resolution match</p>
            <label htmlFor="width-value">Overlay width:</label>
            <div className="chat-settings-size-inputs">
              <input
                id="width-value"
                type="number"
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
              <Button
                type="secondary"
                onClick={() =>
                  setOverlayParameters((prev) => ({
                    ...prev,
                    widthValue: DEFAULT_CHAT_SETTINGS_VALUES.widthValue,
                    widthUnit: DEFAULT_CHAT_SETTINGS_VALUES.widthUnit,
                  }))
                }
              >
                Reset to defaults
              </Button>
            </div>
            <label htmlFor="height-value">Overlay height:</label>
            <div className="chat-settings-size-inputs">
              <input
                id="height-value"
                type="number"
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
              <Button
                type="secondary"
                onClick={() =>
                  setOverlayParameters((prev) => ({
                    ...prev,
                    widthValue: DEFAULT_CHAT_SETTINGS_VALUES.widthValue,
                    widthUnit: DEFAULT_CHAT_SETTINGS_VALUES.widthUnit,
                  }))
                }
              >
                Reset to defaults
              </Button>
            </div>
          </div>
        </section>
        <section>
          <h3>Message padding</h3>
          <label htmlFor="padding-value">Padding between messages:</label>
          <div className="chat-settings-section">
            <div className="chat-settings-size-inputs">
              <input
                id="padding-value"
                type="number"
                placeholder={String(DEFAULT_CHAT_SETTINGS_VALUES.chatMessagePaddingValue)}
                value={overlayParameters.chatMessagePaddingValue}
                onChange={(e) =>
                  setOverlayParameters((prev) => {
                    if (!isNaN(Number(e.target.value))) {
                      return { ...prev, chatMessagePaddingValue: Number(e.target.value) };
                    }
                    return prev;
                  })
                }
                autoComplete="off"
              />
              <select
                id="padding-unit"
                value={overlayParameters.chatMessagePaddingUnit}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, chatMessagePaddingUnit: e.target.value }))}
                autoComplete="off"
                defaultValue={DEFAULT_CHAT_SETTINGS_VALUES.chatMessagePaddingUnit}
              >
                <option value="px">px</option>
                <option value="em">em</option>
                <option value="rem">rem</option>
                <option value="vh">vh</option>
              </select>
              <Button
                type="secondary"
                onClick={() =>
                  setOverlayParameters((prev) => ({
                    ...prev,
                    chatMessagePaddingValue: DEFAULT_CHAT_SETTINGS_VALUES.chatMessagePaddingValue,
                    chatMessagePaddingUnit: DEFAULT_CHAT_SETTINGS_VALUES.chatMessagePaddingUnit,
                  }))
                }
              >
                Reset to defaults
              </Button>
            </div>
          </div>
        </section>
        <section>
          <h3>Avatars</h3>
          <div className="chat-settings-section">
            <label htmlFor="showAvatars">
              <input
                type="checkbox"
                id="showAvatars"
                checked={overlayParameters.showAvatars}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, showAvatars: e.target.checked }))}
              />{' '}
              Show user avatars in the chat overlay
            </label>
          </div>
        </section>
        <section>
          <h3>Borders</h3>
          <div className="chat-settings-section">
            <label htmlFor="showBorders">
              <input
                type="checkbox"
                id="showBorders"
                checked={overlayParameters.showBorders}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, showBorders: e.target.checked }))}
              />{' '}
              Show subscriber borders around chat messages
            </label>
          </div>
        </section>
        <section>
          <h3>Colon after username</h3>
          <div className="chat-settings-section">
            <label htmlFor="showColonAfterDisplayName">
              <input
                type="checkbox"
                id="showColonAfterDisplayName"
                checked={overlayParameters.showColonAfterDisplayName}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, showColonAfterDisplayName: e.target.checked }))}
              />{' '}
              Show a colon symbol after the username in a chat message
            </label>
          </div>
        </section>
        <section>
          <h3>Aliases</h3>
          <div className="chat-settings-section">
            <label htmlFor="showNameAlias">
              <input
                type="checkbox"
                id="showNameAlias"
                checked={overlayParameters.showNameAlias}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, showNameAlias: e.target.checked }))}
              />{' '}
              Show name aliases for localised display names
            </label>
          </div>
        </section>
        <section>
          <h3>Animation</h3>
          <div className="chat-settings-section">
            <label htmlFor="animatedEntry">
              <input
                type="checkbox"
                id="animatedEntry"
                checked={overlayParameters.animatedEntry}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, animatedEntry: e.target.checked }))}
              />{' '}
              Enable animated entry for chat messages
            </label>
          </div>
          <div className="chat-settings-section">
            <label htmlFor="animatedExit">
              <input
                type="checkbox"
                id="animatedExit"
                checked={overlayParameters.animatedExit}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, animatedExit: e.target.checked }))}
              />
              Enabled animated exit for chat messages
            </label>
          </div>
          {overlayParameters.animatedExit && (
            <div className="chat-settings-section">
              <label htmlFor="secondsBeforeExit">Seconds before exit:</label>
              <p>
                <small>Set the number of seconds before the chat message exits.</small>
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
          )}
        </section>
        <section>
          <h3>Drop shadow</h3>
          <div className="chat-settings-section">
            <label htmlFor="dropShadowEnabled">
              <input
                type="checkbox"
                id="dropShadowEnabled"
                checked={overlayParameters.dropShadowEnabled}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, dropShadowEnabled: e.target.checked }))}
              />{' '}
              Enable drop shadow on chat message text
            </label>
          </div>
          {overlayParameters.dropShadowEnabled && (
            <div className="chat-settings-section">
              <Space>
                <Button type="secondary" onClick={applyNiceDropShadowPreset}>
                  Load text-edged preset (this will overwrite your current shadows)
                </Button>
                <Button
                  type="secondary"
                  onClick={() => {
                    setDropShadowSettings(DEFAULT_CHAT_SETTINGS_VALUES.dropShadowSettings);
                    setOverlayParameters((prev) => ({
                      ...prev,
                      dropShadowSettings: DEFAULT_CHAT_SETTINGS_VALUES.dropShadowSettings,
                    }));
                  }}
                >
                  Reset to default
                </Button>
              </Space>
              <TextShadowStacker onChange={(newValue: string) => setDropShadowSettings(newValue)} value={dropShadowSettings} />
            </div>
          )}
        </section>
        <section>
          <h3>Text stroke</h3>
          <div className="chat-settings-section">
            <label htmlFor="textStrokeEnabled">
              <input
                type="checkbox"
                id="textStrokeEnabled"
                checked={overlayParameters.textStrokeEnabled}
                onChange={(e) => setOverlayParameters((prev) => ({ ...prev, textStrokeEnabled: e.target.checked }))}
              />{' '}
              Enable text stroke on chat message text
            </label>
          </div>
          {overlayParameters.textStrokeEnabled && <TextStrokeEditor value={textStrokeSettings} onChange={(v: string) => setTextStrokeSettings(v)} />}
        </section>
        <Button type="primary" className="button-update-chat" onClick={handleUpdateUrl}>
          Update source URL with these settings
        </Button>
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
