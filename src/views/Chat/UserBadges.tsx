import { store } from '../../store/store';
import { ChannelChatMessageEvent } from '../../types/twitchEvents';

interface BadgesProps {
  badges?: ChannelChatMessageEvent['badges'];
}

export const UserBadges = ({ badges }: BadgesProps) => {
  const chatBadges = store((s) => s.chatBadges);

  if (!badges) {
    console.warn('No badges provided to UserBadges component.');
    return null;
  }

  const badgeImages = badges.map((badge) => {
    const foundBadge = chatBadges[`${badge.set_id}_${badge.id}`];

    if (!foundBadge) {
      console.warn(`Badge not found in store: ${badge.set_id}_${badge.id}`);
      return null;
    }

    return <img className="chat-message-badge" alt="" key={foundBadge.name} src={foundBadge.url} width={18}></img>;
  });

  return <>{badgeImages}</>;
};
