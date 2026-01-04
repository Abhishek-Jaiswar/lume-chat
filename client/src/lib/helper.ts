import { useSocket } from "@/hooks/use-socket";
import type { ChatType } from "@/types/chat-types";
import { format, isToday, isYesterday, isThisWeek } from "date-fns";

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
      subHeading: `${chat.participants.length} member`,
      avatar: "",
      isGroup,
    };
  }

  const other = chat.participants.find((p) => p._id !== currentUserId);

  const isOnline = isUserOnline(other?._id ?? "");

  return {
    name: other?.name || "Unknown",
    subHeading: isOnline ? "Online" : "Offline",
    avatar: "",
    isGroup: false,
    isOnline,
  };
};

export const formatChatTime = (date: string | Date) => {
  if (!date) return "";
  const newDate = new Date();
  if (isNaN(newDate.getDate())) return "Invalid date";

  if (isToday(newDate)) return format(newDate, "h:mm a");
  if (isYesterday(newDate)) return "Yesterday";
  if (isThisWeek(newDate)) return format(newDate, "EEEE");
  return format(newDate, "M/d");
};
