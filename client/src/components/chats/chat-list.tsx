import { useChat } from "@/hooks/use-chat";
import { useEffect, useMemo, useState } from "react";
import { Spinner } from "../ui/spinner";
import ChatListItem from "./chat-list-item";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import ChatListHeader from "./chat-list-header";
import { useSocket } from "@/hooks/use-socket";
import type { ChatType, MessageType } from "@/types/chat-types";

const ChatList = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const currentUserId = user?._id || null;
  const navigate = useNavigate();
  const {
    fetchChats,
    chats,
    isChatLoading,
    addNewChat,
    updateChatLastMessage,
  } = useChat();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    if (!socket) return;

    const handleNewChat = (newChat: ChatType) => {
      console.log("Recieved new chat: ", newChat);
      addNewChat(newChat);
    };

    socket.on("chat:new", handleNewChat);

    return () => {
      socket.off("chat:new", handleNewChat);
    };
  }, [addNewChat, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleChatUpdate = (data: {
      chatId: string;
      lastMessage: MessageType;
    }) => {
      console.log("Recieved new chat: ", data.lastMessage);
      updateChatLastMessage(data.chatId, data.lastMessage);
    };

    socket.on("chat:update", handleChatUpdate);

    return () => {
      socket.off("chat:update", handleChatUpdate);
    };
  }, [socket, updateChatLastMessage]);

  const filteredChat = useMemo(() => {
    if (!searchQuery) return chats || [];

    const query = searchQuery.toLowerCase();

    return (
      chats?.filter((chat) => {
        const groupMatch = chat.groupName?.toLowerCase().includes(query);

        const participantMatch = chat.participants?.some(
          (p) =>
            p._id !== currentUserId && p.name?.toLowerCase().includes(query)
        );

        return groupMatch || participantMatch;
      }) || []
    );
  }, [chats, searchQuery, currentUserId]);

  const onRoute = (id: string) => {
    navigate(`/chat/${id}`);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-sidebar">
      <ChatListHeader onSearch={setSearchQuery} />
      <div className="flex-1 overflow-y-auto">
        <div className="px-2 pb-10 space-y-1">
          {isChatLoading ? (
            <div className="flex items-center justify-center py-10">
              <Spinner className="h-7 w-7" />
            </div>
          ) : filteredChat.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground text-sm">
              {searchQuery ? "No matching chats" : "No chats created"}
            </div>
          ) : (
            filteredChat.map((chat) => (
              <ChatListItem
                key={chat._id}
                chat={chat}
                onClick={() => onRoute(chat._id)}
                currentUserId={currentUserId as string}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatList;
