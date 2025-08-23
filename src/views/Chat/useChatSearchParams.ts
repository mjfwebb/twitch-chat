import { DEFAULT_CHAT_SETTINGS_VALUES } from '../../constants';
import { chatSearchParamsMap } from './chatSearchParamsMap';

export const useChatSearchParams = () => {
  const searchParams = new URLSearchParams(window.location.search);

  // Controls whether chat entries animate in. Defaults to true.
  const animatedEntry = searchParams.get(chatSearchParamsMap.animatedEntry) === 'false' ? false : DEFAULT_CHAT_SETTINGS_VALUES.animatedEntry;

  // Background color of the chat container. Defaults to 'transparent'.
  const backgroundColor = searchParams.get(chatSearchParamsMap.backgroundColor) || DEFAULT_CHAT_SETTINGS_VALUES.backgroundColor;

  // Height of the chat container with unit (e.g., '100vh'). Defaults to '100vh'.
  const height =
    searchParams.get(chatSearchParamsMap.height) || `${DEFAULT_CHAT_SETTINGS_VALUES.heightValue}${DEFAULT_CHAT_SETTINGS_VALUES.heightUnit}`;

  // Width of the chat container with unit (e.g., '500px'). Defaults to '500px'.
  const width = searchParams.get(chatSearchParamsMap.width) || `${DEFAULT_CHAT_SETTINGS_VALUES.widthValue}${DEFAULT_CHAT_SETTINGS_VALUES.widthUnit}`;

  // Controls whether chat entries animate out after a delay. Defaults to false.
  const animatedExit = searchParams.get(chatSearchParamsMap.animatedExit) === 'true' ? true : DEFAULT_CHAT_SETTINGS_VALUES.animatedExit;

  // Number of seconds before a chat message exits (when animatedExit is true). Defaults to 10.
  const secondsBeforeExit =
    searchParams.get(chatSearchParamsMap.secondsBeforeExit) !== null
      ? Number(searchParams.get(chatSearchParamsMap.secondsBeforeExit))
      : DEFAULT_CHAT_SETTINGS_VALUES.secondsBeforeExit;

  // Controls whether drop shadow is applied to the chat container. Defaults to false.
  const dropShadowEnabled =
    searchParams.get(chatSearchParamsMap.dropShadowEnabled) === 'true' ? true : DEFAULT_CHAT_SETTINGS_VALUES.dropShadowEnabled;

  // CSS drop shadow settings (e.g., '1px 1px 2px #000000ff'). Defaults to '1px 1px 2px #000000ff'.
  const dropShadowSettings = searchParams.get(chatSearchParamsMap.dropShadowSettings) || DEFAULT_CHAT_SETTINGS_VALUES.dropShadowSettings;

  // Controls whether thick text shadow is applied to chat text. Defaults to false.
  const thickTextShadowEnabled =
    searchParams.get(chatSearchParamsMap.thickTextShadowEnabled) === 'true' ? true : DEFAULT_CHAT_SETTINGS_VALUES.thickTextShadowEnabled;

  // Text color for chat messages. Defaults to '#ffffff'.
  const foregroundColor = searchParams.get(chatSearchParamsMap.foregroundColor) || DEFAULT_CHAT_SETTINGS_VALUES.foregroundColor;

  // Controls whether user avatars are displayed. Defaults to true.
  const showAvatars = searchParams.get(chatSearchParamsMap.showAvatars) === 'false' ? false : DEFAULT_CHAT_SETTINGS_VALUES.showAvatars;

  // Controls whether chat message borders are displayed. Defaults to true.
  const showBorders = searchParams.get(chatSearchParamsMap.showBorders) === 'false' ? false : DEFAULT_CHAT_SETTINGS_VALUES.showBorders;

  // Controls whether a colon is shown after display names. Defaults to false.
  const showColonAfterDisplayName =
    searchParams.get(chatSearchParamsMap.showColonAfterDisplayName) === 'true' ? true : DEFAULT_CHAT_SETTINGS_VALUES.showColonAfterDisplayName;

  // Controls whether text stroke is applied to chat text. Defaults to false.
  const textStrokeEnabled =
    searchParams.get(chatSearchParamsMap.textStrokeEnabled) === 'true' ? true : DEFAULT_CHAT_SETTINGS_VALUES.textStrokeEnabled;

  // CSS text stroke settings (e.g., '1px black'). Defaults to '1px black'.
  const textStrokeSettings = searchParams.get(chatSearchParamsMap.textStrokeSettings) || DEFAULT_CHAT_SETTINGS_VALUES.textStrokeSettings;

  // Font size with unit (e.g., '1em'). Defaults to '1em'.
  const fontSize =
    searchParams.get(chatSearchParamsMap.fontSize) || `${DEFAULT_CHAT_SETTINGS_VALUES.fontSizeValue}${DEFAULT_CHAT_SETTINGS_VALUES.fontSizeUnit}`;

  // Font family for chat text. Defaults to 'Sans-Serif'.
  const fontFamily = searchParams.get(chatSearchParamsMap.fontFamily) || DEFAULT_CHAT_SETTINGS_VALUES.fontFamily;

  // Padding around chat messages with unit (e.g., '5px'). Defaults to '5px'.
  const chatMessagePadding =
    searchParams.get(chatSearchParamsMap.chatMessagePadding) ||
    `${DEFAULT_CHAT_SETTINGS_VALUES.chatMessagePaddingValue}${DEFAULT_CHAT_SETTINGS_VALUES.chatMessagePaddingUnit}`;

  // Controls whether to show name alias when display name differs from login. Defaults to true.
  const showNameAlias = searchParams.get(chatSearchParamsMap.showNameAlias) === 'false' ? false : DEFAULT_CHAT_SETTINGS_VALUES.showNameAlias;

  return {
    animatedEntry,
    animatedExit,
    backgroundColor,
    chatMessagePadding,
    dropShadowEnabled,
    dropShadowSettings,
    fontFamily,
    fontSize,
    foregroundColor,
    height,
    secondsBeforeExit,
    showAvatars,
    showBorders,
    showColonAfterDisplayName,
    showNameAlias,
    textStrokeEnabled,
    textStrokeSettings,
    thickTextShadowEnabled,
    width,
  };
};
