import { BETTER_TTV_WEBSOCKET_URL } from "../../constants";
import { addBetterTTVEmote, removeBetterTTVEmote } from "../../loadEmotes";
import { store } from "../../store/store";
import { hasOwnProperty } from "../../utils/hasOwnProperty";
import { logger } from "../../utils/logger";
import type { BttvEmote } from "./schemas";

let socket: WebSocket;

export function runBetterTTVWebsocket() {
  socket = new WebSocket(BETTER_TTV_WEBSOCKET_URL);

  function joinChannel(connection: WebSocket) {
    if (connection.readyState !== WebSocket.OPEN) {
      logger.error(
        "BetterTTV WebSocket: Connection not open, cannot join channel, retrying in 1 second"
      );
      setTimeout(() => joinChannel(connection), 1000);
      return;
    }
    connection.send(
      JSON.stringify({
        name: "join_channel",
        data: { name: `twitch:${store.getState().broadcasterId}` },
      })
    );
  }

  socket.addEventListener("error", function (error) {
    logger.error(`BetterTTV WebSocket: Connect Error: ${String(error)}`);
  });

  socket.addEventListener("open", function () {
    logger.info("BetterTTV WebSocket: Client Connected");

    joinChannel(socket);

    socket.addEventListener("error", function (error) {
      logger.error(
        "BetterTTV WebSocket: Connection Error: " + error.toString()
      );
    });

    socket.addEventListener("close", function () {
      logger.info("BetterTTV WebSocket: Connection Closed");
    });

    socket.addEventListener("message", function (message) {
      if (hasOwnProperty(message, "utf8Data")) {
        const data = JSON.parse(message.utf8Data as string) as {
          name: string;
          data: unknown;
        };

        switch (data.name) {
          case "emote_delete":
            if (
              hasOwnProperty(data.data, "emoteId") &&
              typeof data.data.emoteId === "string"
            ) {
              logger.info(
                `BetterTTV WebSocket: Removing emote ${data.data.emoteId}`
              );
              removeBetterTTVEmote(data.data.emoteId);
            }
            break;
          case "emote_create":
            if (
              hasOwnProperty(data.data, "emote") &&
              hasOwnProperty(data.data.emote, "code")
            ) {
              const emote = data.data.emote as BttvEmote;
              logger.info(`BetterTTV WebSocket: Adding emote ${emote.code}`);
              addBetterTTVEmote(emote);
            }
            break;
          default:
            break;
        }
      }
    });
  });
}
