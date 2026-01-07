import { ArrowLeft, Menu } from "lucide-react";
import AvatarWithBadge from "../avatar-with-badge";
import type { ChatType } from "@/types/chat-types";
import { useNavigate } from "react-router-dom";
import { getOtherUserAndGroup } from "@/lib/helper";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { useSidebar } from "@/contexts/sidebar-context";
import { Button } from "../ui/button";

interface Props {
  chat: ChatType;
  currentUserId: string | null;
}

const ChatHeader = ({ chat, currentUserId }: Props) => {
  const navigate = useNavigate();
  const { toggle } = useSidebar();
  const { name, subHeading, avatar, isGroup, isOnline } = getOtherUserAndGroup(
    chat,
    currentUserId
  );

  return (
    <div className="flex items-center gap-2 border-b border-border px-2 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
      <Button
        variant="ghost"
        size="icon"
        className="ml-1 shrink-0"
        onClick={toggle}
      >
        <Menu className="size-5" />
      </Button>

      <div className=" h-14 px-2 flex items-center flex-1 min-w-0">
        <div className="shrink-0">
          <ArrowLeft
            className="w-5 h-5 inline-block lg:hidden text-muted-foreground cursor-pointer mr-2"
            onClick={() => navigate(PROTECTED_ROUTES.CHAT)}
          />
        </div>
        <AvatarWithBadge
          name={name}
          src={avatar || ""}
          isGroup={isGroup}
          isOnline={isOnline}
        />

        <div className="ml-2 truncate">
          <h5 className="font-semibold truncate">{name}</h5>
          <p
            className={`text-xs truncate ${isOnline ? "text-green-500" : "text-muted-foreground"
              }`}
          >
            {subHeading}
          </p>
        </div>
      </div>

      <div className="hidden md:flex py-4 h-full text-center cursor-pointer border-primary font-medium text-primary px-4 shrink-0">
        Chat
      </div>
    </div>
  );
};

export default ChatHeader;
