import twemoji from '@twemoji/api';
import classNames from 'classnames';
import { Fragment, JSX } from 'react';
import { store } from '../../store/store';
import { ChannelChatMessageEvent } from '../../types/twitchEvents';
import { ChatCheer, ChatCheerWithBits, ChatEmote } from '../../types/types';
import { bttvModifierMap, bttvModifiers } from './bttvModifierFlags';
import { parseFrankerFaceZModifierFlags } from './parseFrankerFaceZModifierFlags';
import { parseSevenTVModifierFlags } from './parseSevenTVModifierFlags';

// emote regex which separates strings based on whitespace
const wordRegex = /(\s+)/g;
const unicodeRegex = /([\p{So}\p{Sk}\p{S}\p{P}\p{M}])/gu;

function getTwitchEmote(emoteId: string): ChatEmote {
  return {
    origin: 'twitch',
    src: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/dark/3.0`,
    width: null,
    height: null,
    modifier: false,
    hidden: false,
    modifierFlags: 0,
    srcSet: '',
    name: '',
    id: emoteId,
  };
}

export const ChatImageRenderer = ({ fragments }: { fragments: ChannelChatMessageEvent['message']['fragments'] }): JSX.Element => {
  const chatEmotes = store((s) => s.chatEmotes);
  const chatCheers = store((s) => s.chatCheers);

  function findChatCheer(prefix: string, bits: number): ChatCheer | undefined {
    let foundCheer: ChatCheer | undefined = undefined;
    for (const cheer of Object.values(chatCheers)) {
      if (cheer.prefix.toLowerCase() === prefix.toLowerCase() && cheer.minBits <= bits) {
        foundCheer = cheer;
      }
    }

    return foundCheer;
  }

  const messageParts: {
    match: string;
    emote: ChatEmote | undefined;
    cheer: ChatCheerWithBits | undefined;
    skip: boolean;
    modifierFlags?: string[];
  }[] = [];

  const nextMessageModifierFlags: string[] = [];

  fragments.forEach((fragment) => {
    if (fragment.type === 'cheermote') {
      if (fragment.cheermote) {
        const foundCheer = findChatCheer(fragment.cheermote.prefix, fragment.cheermote.bits);
        if (foundCheer) {
          const cheer: ChatCheerWithBits = {
            ...foundCheer,
            bits: fragment.cheermote.bits,
          };

          messageParts.push({
            match: fragment.text,
            emote: undefined,
            cheer,
            skip: false,
          });
          nextMessageModifierFlags.length = 0;
          return;
        }
      }
    }

    if (fragment.emote) {
      messageParts.push({
        match: fragment.text,
        emote: getTwitchEmote(fragment.emote.id),
        cheer: undefined,
        skip: false,
      });
      nextMessageModifierFlags.length = 0;
      return;
    }

    fragment.text.split(wordRegex).forEach((match) => {
      if (bttvModifiers.includes(match)) {
        messageParts.push({
          match,
          emote: undefined,
          cheer: undefined,
          skip: true,
        });
        nextMessageModifierFlags.push(bttvModifierMap[match]);
      } else if (chatEmotes[match] && !chatEmotes[match].hidden) {
        messageParts.push({
          match,
          emote: chatEmotes[match],
          cheer: undefined,
          skip: false,
          modifierFlags: [...nextMessageModifierFlags],
        });
        nextMessageModifierFlags.length = 0;
      } else {
        let src = '';

        match.split(unicodeRegex).forEach((unicodeMatch) => {
          src = '';

          twemoji.parse(unicodeMatch, {
            callback: (icon, options) => {
              const parseCallbackOptions = options as {
                base: string;
                size: 'svg';
                ext: '.svg';
              };
              if (icon.length === 0) {
                return false;
              }

              // Taken from twemoji
              switch (icon) {
                case 'a9': // ©
                case 'ae': // ®
                case '2122': // ™
                  return false;
                default:
                  break;
              }

              src = `${parseCallbackOptions.base}${parseCallbackOptions.size}/${icon}${parseCallbackOptions.ext}`;

              return false;
            },
          });

          if (src) {
            messageParts.push({
              match: unicodeMatch,
              emote: {
                origin: 'emoji',
                src,
                srcSet: '',
                width: null,
                height: null,
                modifier: false,
                hidden: false,
                modifierFlags: 0,
                name: unicodeMatch,
                id: unicodeMatch,
              },
              cheer: undefined,
              skip: false,
              modifierFlags: [...nextMessageModifierFlags],
            });
            nextMessageModifierFlags.length = 0;
          } else {
            messageParts.push({
              match: unicodeMatch,
              emote: undefined,
              cheer: undefined,
              skip: false,
            });
          }
        });
      }
    });
  });

  return (
    <>
      {messageParts.map(({ match, emote, cheer, skip, modifierFlags }, index) => {
        if (cheer) {
          // Get the cheer amount without the name:
          const cheerAmount = Number(match.replace(/\D/g, ''));

          return (
            <Fragment key={`${match}.${index}`}>
              <img className={classNames('chat-cheer')} src={cheer.url} alt={match} title={match} width={28} />
              <span className={classNames('chat-cheer-amount')} style={{ color: cheer.color }}>
                {cheerAmount}
              </span>
            </Fragment>
          );
        }

        if (skip) {
          return null;
        }

        if (!emote || !emote.src) {
          return match;
        }

        const modifierClasses: string[] = [...(modifierFlags || [])];
        const zeroWidthEmotes: ChatEmote[] = [];
        let nextIndex = index + 1;

        while (nextIndex > -1) {
          const nextMessagePart = messageParts[nextIndex];

          // No next message part
          if (!nextMessagePart) {
            nextIndex = -1;
            continue;
          }

          // Next message part is a space
          if (nextMessagePart.match === ' ') {
            nextIndex++;
            continue;
          }

          // Next message part is not an emote
          if (!nextMessagePart.emote) {
            nextIndex = -1;
            continue;
          }

          // Next message part is a modifier
          if (nextMessagePart.emote && nextMessagePart.emote.modifierFlags > 0) {
            let nextMessageParsedFlags: string[] = [];
            if (nextMessagePart.emote.origin === 'sevenTV') {
              nextMessageParsedFlags = parseSevenTVModifierFlags(nextMessagePart.emote.modifierFlags);
            } else if (nextMessagePart.emote.origin === 'frankerFaceZ') {
              nextMessageParsedFlags = parseFrankerFaceZModifierFlags(nextMessagePart.emote.modifierFlags);
            }

            // Next message part is a modifier that applies to this emote
            if (nextMessageParsedFlags.length > 0) {
              if (nextMessagePart.emote.origin === 'sevenTV' && nextMessageParsedFlags.includes('zerowidth')) {
                zeroWidthEmotes.push(nextMessagePart.emote);
              }
              // Hide the next message part
              messageParts[nextIndex].skip = true;

              // Add the modifier flags to this emote
              const filteredFlags = nextMessageParsedFlags.filter((flag) => flag !== 'hidden');
              modifierClasses.push(...filteredFlags);

              // Continue to the next message part
              nextIndex++;
              continue;
            }
          }

          // Next message part is not a modifier that applies to this emote
          nextIndex = -1;
        }

        if (emote) {
          const image = (
            <img
              className={classNames(
                'chat-emote',
                emote.origin === 'emoji' && 'chat-emote--emoji',
                modifierClasses.map((flag) => `chat-emote--${flag}`),
              )}
              key={`${match}.${index}`}
              src={emote.src}
              srcSet={emote.srcSet}
              alt={match}
              title={match}
              {...(modifierClasses.includes('growx')
                ? {
                    width: (emote.width || 36 * 3) > 112 ? 112 : emote.width || 36 * 3,
                  }
                : {})}
            />
          );

          if (zeroWidthEmotes.length > 0) {
            return (
              <div className="chat-emote--zero-width-wrapper" key={`${match}.${index}`}>
                {image}
                {zeroWidthEmotes.map((zeroWidthEmote, index) => (
                  <span key={index} className="chat-emote--zero-width-span">
                    <img
                      className={classNames('chat-emote', 'chat-emote--zero-width-img')}
                      src={zeroWidthEmote.src}
                      srcSet={zeroWidthEmote.srcSet}
                      alt={''}
                      title={''}
                    />
                  </span>
                ))}
              </div>
            );
          } else {
            return image;
          }
        }
      })}
    </>
  );
};
