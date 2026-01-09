import ChatBody from "@/components/chats/chat-body";
import ChatFooter from "@/components/chats/chat-footer";
import ChatHeader from "@/components/chats/chat-header";
import EmptyState from "@/components/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/hooks/use-auth";
import { useChat } from "@/hooks/use-chat";
import useChatId from "@/hooks/use-chat-id";
import { useSocket } from "@/hooks/use-socket";
import type { MessageType } from "@/types/chat-types";
import { useEffect, useState } from "react";

const SignleChat = () => {
  const chatId = useChatId();
  const { fetchSingleChat, isSingleChatLoading, singleChat } = useChat();
  const { socket } = useSocket();
  const { user } = useAuth();

  const [replyTo, setReplyTo] = useState<MessageType | null>(null);
  const currentUserId = user?._id || null;

  const chat = singleChat?.chat;
  const messages = singleChat?.messages || [];

  const isAiChat = chat?.isAiChat || false;

  useEffect(() => {
    if (!chatId) return;
    fetchSingleChat(chatId);
  }, [fetchSingleChat, chatId]);

  useEffect(() => {
    if (!chatId || !socket) return;

    socket?.emit("chat:join", chatId);

    return () => {
      socket.emit("chat:leave", chatId);
    };
  }, [chatId, socket]);

  if (isSingleChatLoading) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <Spinner className="w-11 h-11 text-primary!" />
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="h-full flex-1 flex items-center justify-center">
        <p className="text-lg">Chat not found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full overflow-hidden">
      <div className="h-full flex flex-col overflow-hidden">
        <ChatHeader chat={chat} currentUserId={currentUserId} />
        {messages.length === 0 ? (
          <EmptyState
            title="Start a conversation"
            description="No messages yet. send the first message"
          />
        ) : (
          <ChatBody
            chatId={chatId}
            messages={messages}
            onReply={setReplyTo}
            isGroup={chat?.isGroup}
          />
        )}

        {chatId && (
          <ChatFooter
            replyTo={replyTo}
            chatId={chatId}
            currentUserId={currentUserId}
            onCancelReply={() => setReplyTo(null)}
            isAiChat={isAiChat}
          />
        )}
      </div>
    </div>
  );
};

export default SignleChat;
