import classNames from 'classnames';
import { store } from '../../store/store';
import { ChannelChatMessageEvent } from '../../types/twitchEvents';
import { ChatImageRenderer } from './ChatImageRenderer';
import { contrastCorrected } from './contrastCorrected';
import { UserBadges } from './UserBadges';

interface ChatEntryProps {
  chatMessage: ChannelChatMessageEvent;
  backgroundColor: string;
  showAvatars: boolean;
  showBorders: boolean;
  dropShadowEnabled: boolean;
  dropShadowSettings: string;
  thickTextShadowEnabled: boolean;
  textStrokeEnabled: boolean;
  textStrokeSettings: string;
  showColonAfterDisplayName: boolean;
  chatMessagePadding: string;
}

export const ChatEntry = ({
  chatMessage,
  backgroundColor,
  showAvatars,
  showBorders,
  dropShadowEnabled,
  dropShadowSettings,
  textStrokeEnabled,
  textStrokeSettings,
  thickTextShadowEnabled,
  showColonAfterDisplayName,
  chatMessagePadding,
}: ChatEntryProps) => {
  const gigantified = chatMessage.message_type === 'power_ups_gigantified_emote';
  const actionMessage = chatMessage.message.text.startsWith('\u0001ACTION');

  // Set default user if no user
  const user: { displayName: string; avatarUrl: string } = {
    displayName: chatMessage.chatter_user_name,
    avatarUrl: store.getState().userInformation[chatMessage.chatter_user_id]?.profile_image_url || '',
  };

  return (
    <button className={classNames('chat-message')}>
      <div
        className={classNames(
          'chat-message-body',
          showBorders && chatMessage.badges.find((badge) => badge.set_id === 'subscriber') && 'chat-message-body-subscriber',
          dropShadowEnabled && thickTextShadowEnabled && 'chat-message-body-thick-text-shadow',
          gigantified && 'chat-message-body-gigantified',
        )}
        style={{
          ...(dropShadowEnabled && !thickTextShadowEnabled
            ? {
                textShadow: dropShadowSettings,
              }
            : {}),
          ...(textStrokeEnabled
            ? {
                ['-webkit-text-stroke']: textStrokeSettings,
              }
            : {}),
          padding: chatMessagePadding,
        }}
      >
        <span>
          {showAvatars && user.avatarUrl && <img className="chat-message-avatar-image" src={user.avatarUrl} alt="avatar" height={34} />}
          <UserBadges badges={chatMessage.badges} />
          <span
            className="chat-message-nick"
            style={{
              color: contrastCorrected(chatMessage.color || '#fff', backgroundColor),
            }}
          >
            {user.displayName}
          </span>
          {showColonAfterDisplayName && !actionMessage && ': '}
          <span className={classNames('chat-message-text', actionMessage && 'chat-message-text-action')}>
            <ChatImageRenderer fragments={chatMessage.message.fragments} />
          </span>
        </span>
      </div>
    </button>
  );
};
