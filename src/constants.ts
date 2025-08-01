export const TWITCH_CHAT_IRC_WS_URL = "ws://irc-ws.chat.twitch.tv:80";
export const TWITCH_HELIX_URL = "https://api.twitch.tv/helix/";
export const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/";
export const TWITCH_WEBSOCKET_EVENTSUB_URL = "wss://eventsub.wss.twitch.tv/ws";
export const TWITCH_INSIGHTS_URL = "https://api.twitchinsights.net/v1/";
export const SEVEN_TV_WEBSOCKET_URL = "wss://events.7tv.io/v3";
export const BETTER_TTV_WEBSOCKET_URL = "wss://sockets.betterttv.net/ws";

export const SECOND_MS = 1000;
export const MINUTE_MS = 60000;
export const MAX_TWITCH_MESSAGE_LENGTH = 500;
export const CHAT_MESSAGES_TO_RETAIN = 20;

const PRESET_CHAT_SETTINGS_VALUES = {
  dropShadowSettingsPresetSmall: "1px 1px 2px #000000ff",
  dropShadowSettingsPresetMedium: "2px 2px 4px #000000ff",
  dropShadowSettingsPresetLarge: "2px 2px 6px #000000ff",
  textStrokeSettingsPresetThin: "1px black",
  textStrokeSettingsPresetMedium: "2px black",
  textStrokeSettingsPresetThick: "3px black",
  fontSizeValueSmall: 0.75,
  fontSizeValueMedium: 1,
  fontSizeValueLarge: 1.25,
  fontSizeUnit: "em",
};

export const DEFAULT_CHAT_SETTINGS_VALUES = {
  heightValue: 100,
  heightUnit: "vh",
  widthValue: 500,
  widthUnit: "px",
  secondsBeforeExit: 10,
  backgroundColor: "transparent",
  foregroundColor: "#ffffff",
  dropShadowSettings: PRESET_CHAT_SETTINGS_VALUES.dropShadowSettingsPresetSmall,
  textStrokeSettings: PRESET_CHAT_SETTINGS_VALUES.textStrokeSettingsPresetThin,
  fontSizeValue: PRESET_CHAT_SETTINGS_VALUES.fontSizeValueMedium,
  fontSizeUnit: PRESET_CHAT_SETTINGS_VALUES.fontSizeUnit,
  fontFamily: "Sans-Serif",
  chatMessagePaddingValue: 5,
  chatMessagePaddingUnit: "px",
};
