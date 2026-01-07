import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat-types";
import { useEffect, useRef, useState } from "react";
import { ChatBodyMessage } from "./chat-body-message";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
  isGroup?: boolean;
}

const SCROLL_THRESHOLD = 120;

const ChatBody = ({ chatId, messages, onReply, isGroup = false }: Props) => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    setShouldAutoScroll(distanceFromBottom < SCROLL_THRESHOLD);
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, shouldAutoScroll]);

  useEffect(() => {
    if (!chatId || !socket) return;

    const { handleAiStream, addNewMessage } = useChat.getState();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleAiStreamEvent = (data: any) => {
      handleAiStream(data);
    };

    const handleNewMessageEvent = (msg: MessageType) => {
      addNewMessage(chatId, msg, msg._id);
    };

    socket.on("chat:ai", handleAiStreamEvent);
    socket.on("message:new", handleNewMessageEvent);

    return () => {
      socket.off("chat:ai", handleAiStreamEvent);
      socket.off("message:new", handleNewMessageEvent);
    };
  }, [chatId, socket]);

  return (
    <div className="flex-1 overflow-hidden relative">
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto"
        style={{ backgroundColor: user?.wallpaper || "transparent" }}
      >
        <div className="w-full max-w-6xl mx-auto flex flex-col px-3 py-4 min-h-full">
          {messages?.filter(Boolean).map((message) => (
            <ChatBodyMessage
              key={message._id}
              message={message}
              onReply={onReply}
              isGroup={isGroup}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
    </div>
  );
};

export default ChatBody;
