import { ArrowLeft } from "lucide-react";
import AvatarWithBadge from "../avatar-with-badge";
import type { ChatType } from "@/types/chat-types";
import { useNavigate } from "react-router-dom";
import { getOtherUserAndGroup } from "@/lib/helper";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { SidebarTrigger } from "../ui/sidebar";

interface Props {
  chat: ChatType;
  currentUserId: string | null;
}

const ChatHeader = ({ chat, currentUserId }: Props) => {
  const navigate = useNavigate();
  const { name, subHeading, avatar, isGroup, isOnline } = getOtherUserAndGroup(
    chat,
    currentUserId
  );

  return (
    <div className="flex items-center gap-2 border-b border-border px-2 z-50">
      <SidebarTrigger className="ml-2" />
      <div className=" h-14 px-2 flex items-center">
        <div>
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

        <div className="ml-2">
          <h5 className="font-semibold">{name}</h5>
          <p
            className={`text-xs ${isOnline ? "text-green-500" : "text-muted-foreground"
              }`}
          >
            {subHeading}
          </p>
        </div>
      </div>

      <div className="flex-1 py-4 h-full text-center cursor-pointer border-primary font-medium text-primary ">
        Chat
      </div>
    </div>
  );
};

export default ChatHeader;
