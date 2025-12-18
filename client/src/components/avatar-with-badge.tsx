import React from "react";
import { Avatar, AvatarImage } from "./ui/avatar";
import { AvatarFallback } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

interface IAvatarWithBadge {
  name: string;
  src?: string;
  size?: string;
  isOnline?: boolean;
  isGroup?: boolean;
  className?: string;
}

const AvatarWithBadge = ({
  name,
  src,
  isGroup,
  size = "w-9 h-9",
  isOnline,
  className,
}: IAvatarWithBadge) => {
  const avatar = isGroup ? "sad" : src;

  return (
    <div className="relative shrink-0 ">
      <Avatar
        className={`${size} flex items-center justify-center`}
      >
        <AvatarImage src={avatar} />
        <AvatarFallback
          className={cn(
            `bg-primary/10 text-primary font-semibold w-full h-full flex items-center justify-center`,
            className && className
          )}
        >
          {name?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      {isOnline && !isGroup && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-border bg-green-600"></span>
      )}
    </div>
  );
};

export default AvatarWithBadge;
