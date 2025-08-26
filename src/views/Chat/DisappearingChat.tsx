import { useEffect, useRef } from 'react';

import { AnimatePresence, motion } from 'framer-motion';

import { store } from '../../store/store';
import { ChannelChatMessageEvent } from '../../types/twitchEvents';
import { ChatEntry } from './ChatEntry';
import { useChatSearchParams } from './useChatSearchParams';

type MessageProps = {
  chatMessage: ChannelChatMessageEvent;
};

const Message = ({ chatMessage }: MessageProps) => {
  const chatSearchParams = useChatSearchParams();

  useEffect(() => {
    const timer = setTimeout(() => {
      store.getState().removeChatMessage(chatMessage);
    }, chatSearchParams.secondsBeforeExit * 1000);

    return () => {
      clearTimeout(timer);
    };
  }, [chatSearchParams.secondsBeforeExit, chatMessage]);

  const ChatEntryProps = {
    chatMessage,
    backgroundColor: chatSearchParams.backgroundColor,
    showAvatars: chatSearchParams.showAvatars,
    showBorders: chatSearchParams.showBorders,
    dropShadowEnabled: chatSearchParams.dropShadowEnabled,
    dropShadowSettings: chatSearchParams.dropShadowSettings,
    showColonAfterDisplayName: chatSearchParams.showColonAfterDisplayName,
    textStrokeEnabled: chatSearchParams.textStrokeEnabled,
    textStrokeSettings: chatSearchParams.textStrokeSettings,
    chatMessagePadding: chatSearchParams.chatMessagePadding,
    showNameAlias: chatSearchParams.showNameAlias,
    userInformationStore: store.getState().userInformation,
  };

  if (chatSearchParams.animatedEntry) {
    return (
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="message">
        <ChatEntry {...ChatEntryProps} />
      </motion.div>
    );
  } else {
    return <ChatEntry {...ChatEntryProps} />;
  }
};

export const DisappearingChat = () => {
  const chatMessageEvents = store((s) => s.chatMessageEvents);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessageEvents]);

  return (
    <div className="chat-disappearing">
      <AnimatePresence>
        {chatMessageEvents.map((chatMessage) => (
          <Message key={chatMessage.message_id} chatMessage={chatMessage} />
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
};
