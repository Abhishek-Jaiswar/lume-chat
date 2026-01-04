import { useChat } from "@/hooks/use-chat";
import React, { memo, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import {
  ArrowLeftIcon,
  PenBoxIcon,
  Search,
  UserIcon,
  UsersIcon,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";
import { Spinner } from "../ui/spinner";
import type { TUser } from "@/types/auth.types";
import AvatarWithBadge from "../avatar-with-badge";
import { Checkbox } from "../ui/checkbox";
import { cn } from "@/lib/utils";

export const NewChatPopover = memo(() => {
  const { fetchAllUsers, users, isUsersLoading, createChats, isCreatingChat } =
    useChat();
  const [isOpen, setIsOpen] = useState(false);
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedUser, setSelectedUser] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [loadingUserId, setLoadingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchAllUsers();
  }, [fetchAllUsers]);

  const toggleUserSelection = (id: string) => {
    setSelectedUser((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  const handleBack = () => {
    resetState();
  };

  const resetState = () => {
    setIsGroupMode(false);
    setGroupName("");
    setSelectedUser([]);
    setSearchTerm("");
    setLoadingUserId(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    resetState();
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedUser?.length === 0) return;
    try {
      await createChats({
        isGroup: true,
        participants: selectedUser,
        groupName: groupName,
      });
      setIsOpen(false);
      resetState();
    } catch (error) {
      console.error("Failed to create group:", error);
      // Keep the popover open for user to retry
    }
  };

  const handleCreateChat = async (userId: string) => {
    setLoadingUserId(userId);
    try {
      await createChats({
        isGroup: false,
        participantId: userId,
      });
      setIsOpen(false);
      resetState();
    } catch (error) {
      console.error("Failed to create chat:", error);
      // Keep the popover open and loading state for user feedback
    } finally {
      setLoadingUserId(null);
    }
  };

  const filteredUsers = users?.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setIsOpen(true)}
          variant="ghost"
          size="icon"
          className="h-8 w-8"
        >
          <PenBoxIcon className=" h-5 w-5 stroke-1" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 z-999 p-0 rounded-xl min-h-100 max-h-[80vh] flex flex-col"
      >
        <div className="border-b p-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            {isGroupMode && (
              <Button onClick={handleBack} variant="ghost" size="icon">
                <ArrowLeftIcon size={16} />
              </Button>
            )}
            <h3>{isGroupMode ? "New Group" : "New Chat"}</h3>
          </div>
          <InputGroup>
            <InputGroupInput
              {...(isGroupMode
                ? {
                    value: groupName,
                    onChange: (e) => setGroupName(e.target.value),
                  }
                : {
                    value: searchTerm,
                    onChange: (e) => setSearchTerm(e.target.value),
                  })}
              placeholder={isGroupMode ? "Enter group name" : "Search Name"}
            />
            <InputGroupAddon>
              {isGroupMode ? <UserIcon /> : <Search />}
            </InputGroupAddon>
          </InputGroup>
        </div>

        <div className="flex-1 justify-center overflow-y-auto px-1 py-1 space-y-1">
          {isUsersLoading ? (
            <Spinner className="w-6 h-6" />
          ) : users && users.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No users found
            </div>
          ) : !isGroupMode ? (
            <>
              <NewGroupItem
                disabled={isCreatingChat}
                onClick={() => setIsGroupMode(true)}
                isCreating={isCreatingChat}
              />

              {filteredUsers && filteredUsers.length === 0 && searchTerm ? (
                <div className="text-center text-muted-foreground py-4">
                  No users found matching "{searchTerm}"
                </div>
              ) : (
                filteredUsers?.map((user) => (
                  <ChatUserItem
                    key={user._id}
                    user={user}
                    isLoading={loadingUserId === user._id}
                    disabled={loadingUserId !== null}
                    onClick={handleCreateChat}
                  />
                ))
              )}
            </>
          ) : (
            <>
              {users?.map((user) => (
                <GroupUserItem
                  key={user._id}
                  user={user}
                  isSelected={selectedUser.includes(user._id)}
                  onToggle={toggleUserSelection}
                />
              ))}
            </>
          )}
        </div>

        {isGroupMode && (
          <div className="border-t p-3">
            <Button
              onClick={handleCreateGroup}
              className="w-full"
              disabled={
                isCreatingChat || !groupName.trim() || selectedUser.length === 0
              }
            >
              {isCreatingChat ? (
                <>
                  <Spinner className="mr-2 w-4 h-4" />
                  Creating Group...
                </>
              ) : (
                "Create Group"
              )}
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
});

NewChatPopover.displayName = "NewChatPopover";

export const UserAvatar = memo(({ user }: { user: TUser }) => (
  <>
    <AvatarWithBadge name={user?.name} src={user?.avatar ?? ""} />
    <div>
      <h5 className="text-[13.5px] font-medium truncate">{user?.name}</h5>
      <p className="text-sm text-muted-foreground">
        Hey there, i'm using lume.
      </p>
    </div>
  </>
));

UserAvatar.displayName = "UserAvatar";

const NewGroupItem = memo(
  ({
    disabled,
    onClick,
    isCreating,
  }: {
    disabled: boolean;
    onClick: () => void;
    isCreating?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled || isCreating}
      className={cn(
        "w-full flex items-center gap-2 p-2 rounded-sm transition-colors text-left",
        disabled || isCreating
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-accent"
      )}
    >
      <div className="bg-primary/10 p-2 rounded-full">
        <UsersIcon className="size-4 text-primary" />
      </div>
      <span className="flex-1">New Group</span>
      {isCreating && <Spinner className="w-4 h-4" />}
    </button>
  )
);

NewGroupItem.displayName = "NewGroupItem";

const ChatUserItem = memo(
  ({
    user,
    isLoading,
    disabled,
    onClick,
  }: {
    user: TUser;
    isLoading: boolean;
    disabled: boolean;
    onClick: (id: string) => void;
  }) => (
    <button
      className={cn(
        "relative w-full flex items-center gap-2 p-2 rounded-sm transition-colors text-left",
        isLoading || disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-accent"
      )}
      onClick={() => !isLoading && !disabled && onClick(user._id)}
      disabled={isLoading || disabled}
    >
      <UserAvatar user={user} />
      {isLoading && (
        <div className="ml-auto flex items-center">
          <Spinner className="w-4 h-4" />
        </div>
      )}
    </button>
  )
);

ChatUserItem.displayName = "ChatUserItem";

const GroupUserItem = memo(
  ({
    user,
    isSelected,
    onToggle,
  }: {
    user: TUser;
    isSelected: boolean;
    onToggle: (id: string) => void;
  }) => (
    <label
      role="button"
      className="w-full flex items-center gap-2 p-2 rounded-sm hover:bg-accent transition-colors text-left "
    >
      <UserAvatar user={user} />
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(user._id)}
      />
    </label>
  )
);

GroupUserItem.displayName = "GroupUserItem";
