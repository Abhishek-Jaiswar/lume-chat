import { formatChatTime, getOtherUserAndGroup } from "@/lib/helper";
import { cn } from "@/lib/utils";
import type { ChatType } from "@/types/chat-types";
import { useLocation, useNavigate } from "react-router-dom";
import AvatarWithBadge from "../avatar-with-badge";
import { Trash2Icon } from "lucide-react";
import { useChat } from "@/hooks/use-chat";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../ui/context-menu";

interface IChatListItem {
  chat: ChatType;
  onClick?: () => void;
  currentUserId: string;
}

const ChatListItem = ({ chat, onClick, currentUserId }: IChatListItem) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { deleteChat } = useChat();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { lastMessage, createdAt } = chat;

  const { name, avatar, isOnline, isGroup } = getOtherUserAndGroup(
    chat,
    currentUserId
  );

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteChat(chat._id);
      setShowDeleteDialog(false);
      if (pathname.includes(chat._id)) {
        navigate("/chat");
      }
    } catch (error) {
      console.error("Failed to delete chat:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getLastMessageText = () => {
    if (!lastMessage) {
      return isGroup
        ? chat.createdBy === currentUserId
          ? "Group created"
          : "You were added"
        : "Send a message";
    }

    if (lastMessage.image) return "Photo";
    if (isGroup && lastMessage.sender) {
      return `${lastMessage.sender._id === currentUserId
        ? "You"
        : lastMessage.sender.name
        }: ${lastMessage.content}`;
    }

    return lastMessage.content;
  };

  return (
    <div className="group relative">
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <button
            onClick={onClick}
            className={cn(
              "w-full flex items-center gap-2 p-2 rounded-sm hover:bg-sidebar-accent transition-colors text-left",
              pathname.includes(chat._id) && "bg-sidebar-accent"
            )}
          >
            <AvatarWithBadge
              name={name}
              src={avatar || ""}
              isGroup={isGroup}
              isOnline={isOnline}
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h5 className="text-sm font-semibold truncate">{name}</h5>
                <span className="text-xs ml-2 shrink-0 text-muted-foreground">
                  {formatChatTime(lastMessage?.updatedAt || createdAt)}
                </span>
              </div>
              <p className="text-xs truncate text-muted-foreground -mt-px">
                {getLastMessageText()}
              </p>
            </div>
          </button>
        </ContextMenuTrigger>
        <ContextMenuContent className="w-48">
          <ContextMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2Icon className="mr-2" size={14} />
            Delete Conversation
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Delete Conversation?</DialogTitle>
            <DialogDescription>
              This will permanently delete this chat and all its messages for
              you. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatListItem;
