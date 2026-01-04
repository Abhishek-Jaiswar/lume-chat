import { useChat } from "@/hooks/use-chat";
import React, { useEffect, useMemo, useState } from "react";
import { Spinner } from "../ui/spinner";
import ChatListItem from "./chat-list-item";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import ChatListHeader from "./chat-list-header";

const ChatList = () => {
  const { user } = useAuth();
  const currentUserId = user?._id || null;
  const navigate = useNavigate();
  const { fetchChats, chats, isChatLoading } = useChat();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

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
    <div className="fixed inset-y-0 pb-20 lg:pb-0 lg:max-w-94.75 lg:block border-r border-border bg-sidebar max-w-[calc(100% - 40px)] w-full left-10 z-98">
      <div className="flex flex-col">
        <ChatListHeader onSearch={setSearchQuery} />
        <div className="flex-1 h-[calc(100vh-100px)] overflow-y-auto">
          <div className="px-2 pb-10 space-y-1">
            {isChatLoading ? (
              <div className="flex items-center justify-center">
                <Spinner className="h-7 w-7" />
              </div>
            ) : filteredChat.length === 0 ? (
              <div className="flex items-center justify-center">
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
    </div>
  );
};

export default ChatList;
