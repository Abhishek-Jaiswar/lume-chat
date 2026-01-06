import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Search } from "lucide-react";
import { NewChatPopover } from "./new-chat-popover";
import { SidebarTrigger } from "../ui/sidebar";

const ChatListHeader = ({ onSearch }: { onSearch: (val: string) => void }) => {
  return (
    <div className="px-3 py-3 border-b border-border bg-sidebar shrink-0">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1 lg:hidden" />
          <h1 className="text-xl font-semibold">Chat</h1>
        </div>
        <div>
          <NewChatPopover />
        </div>
      </div>
      <div className="bg-background text-sm rounded-md">
        <InputGroup className="h-9">
          <InputGroupInput
            placeholder="Search..."
            onChange={(e) => onSearch(e.target.value)}
          />
          <InputGroupAddon>
            <Search className="h4 w-4 text-muted-foreground" />
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  );
};

export default ChatListHeader;
