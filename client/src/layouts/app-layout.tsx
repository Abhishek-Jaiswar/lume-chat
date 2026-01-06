import { Outlet } from "react-router-dom";
import AppWrapper from "@/components/app-wrapper";
import useChatId from "@/hooks/use-chat-id";
import { Spinner } from "@/components/ui/spinner";
import ChatList from "@/components/chats/chat-list";

const AppLayout = () => {
  const chatId = useChatId();
  return (
    <AppWrapper>
      {chatId ? (
        <Outlet />
      ) : (
        <div className="h-full flex flex-col">
          {/* <div className="lg:hidden h-full overflow-hidden">
            <ChatList />
          </div> */}
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center text-muted-foreground p-4 text-center">
            <div className="size-20 bg-muted rounded-full flex items-center justify-center mb-4">
              <Spinner className="size-10 text-primary/20" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-1">
              Select a Chat
            </h3>
            <p className="max-w-[250px]">
              Choose a conversation from the sidebar to start chatting.
            </p>
          </div>
        </div>
      )}
    </AppWrapper>
  );
};

export default AppLayout;
