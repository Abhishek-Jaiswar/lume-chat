import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat-types";
import { useEffect, useRef } from "react";
import { ChatBodyMessage } from "./chat-body-message";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
  isGroup?: boolean;
}

const ChatBody = ({ chatId, messages, onReply, isGroup = false }: Props) => {
  const { socket } = useSocket();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const isAtBottom = useRef(true);

  // Track if user is at bottom
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    // 100px threshold
    const atBottom = scrollHeight - scrollTop - clientHeight < 100;
    isAtBottom.current = atBottom;
  };

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior });
    }
  };

  useEffect(() => {
    if (!chatId || !socket) return;

    const { handleAiStream, addNewMessage } = useChat.getState();

    const handleAiStreamEvent = (data: any) => {
      handleAiStream(data);
      // For streaming, we want almost instant scroll to stay at bottom
      if (isAtBottom.current) {
        scrollToBottom("auto");
      }
    };

    const handleNewMessageEvent = (msg: MessageType) => {
      addNewMessage(chatId, msg, msg._id);
      if (isAtBottom.current) {
        scrollToBottom("smooth");
      }
    };

    socket.on("chat:ai", handleAiStreamEvent);
    socket.on("message:new", handleNewMessageEvent);

    return () => {
      socket.off("chat:ai", handleAiStreamEvent);
      socket.off("message:new", handleNewMessageEvent);
    };
  }, [chatId, socket]);

  // Initial scroll and when message list changes significantly
  useEffect(() => {
    if (isAtBottom.current) {
      scrollToBottom("smooth");
    }
  }, [messages?.length]);

  return (
    <div className="flex-1 overflow-hidden">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scroll-smooth"
      >
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col px-3 py-4">
          {messages?.filter(Boolean).map((message) => (
            <ChatBodyMessage
              key={message._id}
              message={message}
              onReply={onReply}
              isGroup={isGroup}
            />
          ))}
          <div ref={bottomRef} className="h-4 w-full" />
        </div>
      </div>
    </div>
  );
};

export default ChatBody;
