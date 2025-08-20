# URL Parameters Reference

This document describes the URL parameters you can use to customize the chat overlay in this project. These parameters can be passed as query parameters in the URL (e.g., `/chat?background-color=%23ffffff&font-size=20px`).

## Important Notes

- **`access_token` is always required.** Without it, chat will not function.
- **`channel` is optional.** If not defined, the overlay will default to the authenticated user's own channel.
- **Channel names are case sensitive.**
- **Default values** for all other parameters are shown below and are defined in the code. See also `src/constants.ts`.

## Parameters

| Parameter                       | Description                                                    | Example Value       |
| ------------------------------- | -------------------------------------------------------------- | ------------------- |
| `access_token`                  | Twitch OAuth access token for authentication                   | `abcdef123456`      |
| `channel`                       | Twitch channel name to connect to (**case sensitive**)         | `Athano`            |
| `animated-entry`                | Enable/disable animated entry of chat messages                 | `true` / `false`    |
| `background-color`              | Background color of the chat overlay                           | `#000000`           |
| `height`                        | Height of the chat overlay (with unit)                         | `400px`             |
| `width`                         | Width of the chat overlay (with unit)                          | `600px`             |
| `animated-exit`                 | Enable/disable animated exit of chat messages                  | `true` / `false`    |
| `seconds-before-exit`           | Seconds before a message disappears (if animated exit enabled) | `10`                |
| `drop-shadow`                   | Enable/disable drop shadow on chat messages                    | `true` / `false`    |
| `drop-shadow-settings`          | CSS drop-shadow settings                                       | `0 2px 8px #000`    |
| `thick-text-shadow`             | Enable/disable thick text shadow                               | `true` / `false`    |
| `foreground-color`              | Text color for chat messages                                   | `#ffffff`           |
| `show-avatars`                  | Show/hide user avatars                                         | `true` / `false`    |
| `show-borders`                  | Show/hide borders around chat messages                         | `true` / `false`    |
| `show-colon-after-display-name` | Show colon after display name                                  | `true` / `false`    |
| `text-stroke-enabled`           | Enable/disable text stroke                                     | `true` / `false`    |
| `text-stroke`                   | CSS text stroke settings                                       | `1px #000`          |
| `font-size`                     | Font size for chat messages (with unit)                        | `18px`              |
| `font-family`                   | Font family for chat messages                                  | `Arial, sans-serif` |
| `chat-message-padding`          | Padding for chat messages (with unit)                          | `8px`               |

## Usage Example

```
https://chat.nice.gg/chat?background-color=%23000000&font-size=20px&show-avatars=false
```

This will set the background color to black, font size to 20px, and hide user avatars.

---

## Default Values

| Parameter              | Default Value           |
| ---------------------- | ----------------------- |
| `height`               | `100vh`                 |
| `width`                | `500px`                 |
| `seconds-before-exit`  | `10`                    |
| `background-color`     | `transparent`           |
| `foreground-color`     | `#ffffff`               |
| `drop-shadow-settings` | `1px 1px 2px #000000ff` |
| `text-stroke`          | `1px black`             |
| `font-size`            | `1em`                   |
| `font-family`          | `Sans-Serif`            |
| `chat-message-padding` | `5px`                   |

For more, see `src/constants.ts`.
