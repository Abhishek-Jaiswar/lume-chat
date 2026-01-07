import { useSocket } from "@/hooks/use-socket";
import type { ChatType } from "@/types/chat-types";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";
import { v4 as uuidv4 } from "uuid";

export const isUserOnline = (userId?: string) => {
  if (!userId) return false;
  const { onlineUsers } = useSocket.getState();
  return onlineUsers.includes(userId);
};

export const getOtherUserAndGroup = (
  chat: ChatType,
  currentUserId: string | null
) => {
  const isGroup = chat?.isGroup;
  if (isGroup) {
    return {
      name: chat.groupName || "Unnamed Group",
      subHeading: `${chat.participants.length} members`,
      avatar: null,
      isGroup,
    };
  }

  const other = chat.participants.find((p) => p._id !== currentUserId);

  const isOnline = isUserOnline(other?._id ?? "");

  const subHeading = other?.isAi ? "AI Assistant" : isOnline ? "Online" : "Offline";

  return {
    name: other?.name || "Unknown",
    subHeading,
    avatar: other?.avatar || null,
    isGroup: false,
    isOnline,
    isAi: other?.isAi || false,
  };
};

export const formatChatTime = (date: string | Date) => {
  if (!date) return "";
  const newDate = new Date(date);
  if (isNaN(newDate.getTime())) return "Invalid date";

  if (isToday(newDate)) return format(newDate, "h:mm a");
  if (isYesterday(newDate)) return "Yesterday";
  if (isThisWeek(newDate)) return format(newDate, "EEEE");
  return format(newDate, "M/d");
};

export function generateUUID(): string {
  return uuidv4();
}
