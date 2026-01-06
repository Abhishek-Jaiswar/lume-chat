import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "./theme-provider";
import { isUserOnline } from "@/lib/helper";
import Logo from "./logo";
import { PROTECTED_ROUTES } from "@/routes/routes";
import { Moon, Sun, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import AvatarWithBadge from "./avatar-with-badge";
import {
  Sidebar as ShadcnSidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "./ui/sidebar";
import ChatList from "./chats/chat-list";

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { state, isMobile } = useSidebar();
  const isOnline = isUserOnline(user?._id);

  return (
    <ShadcnSidebar collapsible="icon" className="border-r border-border bg-sidebar">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border px-4">
        <Logo
          url={PROTECTED_ROUTES.CHAT}
          imgClass="size-8"
          showText={state === "expanded" || isMobile}
          textClass="text-sidebar-foreground truncate font-bold text-lg"
        />
      </SidebarHeader>

      <SidebarContent className="overflow-hidden max-w-[20rem]">
        {state === "expanded" && <ChatList />}
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="w-full flex items-center justify-center p-0"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              tooltip="Toggle Theme"
            >
              <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:rotate-90" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="w-full data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <AvatarWithBadge
                    name={user?.name || "Lume@ukwn"}
                    src={user?.avatar || ""}
                    isOnline={isOnline}
                    className="size-8 shrink-0"
                  />
                  {state === "expanded" && (
                    <div className="flex flex-col items-start truncate ml-2">
                      <span className="text-sm font-semibold truncate w-full text-left">
                        {user?.name}
                      </span>
                      <span className="text-xs text-muted-foreground truncate w-full text-left">
                        {user?.email}
                      </span>
                    </div>
                  )}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56"
                side={state === "expanded" ? "bottom" : "right"}
                align="end"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </ShadcnSidebar>
  );
};

export default Sidebar;

