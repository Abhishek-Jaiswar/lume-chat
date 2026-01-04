import { useChat } from "@/hooks/use-chat";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat-types";
import React, { useEffect, useRef } from "react";
import { ChatBodyMessage } from "./chat-body-message";

interface Props {
  chatId: string | null;
  messages: MessageType[];
  onReply: (message: MessageType) => void;
  isGroup?: boolean;
}

const ChatBody = ({ chatId, messages, onReply, isGroup = false }: Props) => {
  const { socket } = useSocket();
  const { addNewMessage } = useChat();
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!chatId) return;

    if (!socket) return;

    const handleNewMessage = (msg: MessageType) => {
      if (!msg || !msg._id) {
        console.warn("Received invalid message from socket:", msg);
        return;
      }
      addNewMessage(chatId, msg);
    };

    socket.on("message:new", handleNewMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
    };
  }, [chatId, socket, addNewMessage]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto h-full flex flex-col px-3 py-4">
          {messages?.filter(Boolean).map((message) => (
            <ChatBodyMessage
              key={message._id}
              message={message}
              onReply={onReply}
              isGroup={isGroup}
            />
          ))}
        </div>
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default ChatBody;
