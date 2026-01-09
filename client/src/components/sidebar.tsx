import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./theme-provider";
import { isUserOnline } from "@/lib/helper";
import Logo from "./logo";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { Moon, Sun, LogOut, Menu, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AvatarWithBadge from "./avatar-with-badge";
import ChatList from "./chats/chat-list";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/sidebar-context";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { isOpen, toggle } = useSidebar();
  const isOnline = isUserOnline(user?._id);

  return (
    <div className="flex h-screen fixed left-0 top-0 z-50">
      {/* Mini Sidebar (Rail) */}
      <aside
        className={`flex flex-col border-r border-border bg-sidebar shrink-0 items-center py-4 gap-4`}
      >
        <Logo url={PROTECTED_ROUTES.CHAT} imgClass="size-8" showText={false} />

        <div className="flex-1" />

        <div className="flex flex-col gap-4 items-center mb-2">
          {/* Hamburger Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            onClick={toggle}
          >
            <Menu className="size-5" />
          </Button>

          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="size-10"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          </Button>

          {/* User Profile Avatar */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-10 p-0">
                <AvatarWithBadge
                  name={user?.name || "Lume@ukwn"}
                  src={user?.avatar || ""}
                  isOnline={isOnline}
                  className="size-8"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" side="right" align="end">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={PROTECTED_ROUTES.SETTINGS}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Sidebar (Chat List) */}
      <aside
        className={cn(
          "h-svh border-r border-border bg-sidebar transition-[width] duration-300 ease-in-out overflow-hidden flex flex-col",
          isOpen ? "w-74" : "w-0 border-none"
        )}
      >
        <div className="flex-1 overflow-hidden min-w-[256px]">
          <ChatList />
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
