import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { MessageType } from "@/types/chat-types";
import React, { memo, useState } from "react";
import AvatarWithBadge from "../avatar-with-badge";
import { formatChatTime } from "@/lib/helper";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Spinner } from "../ui/spinner";
import {
  ReplyIcon,
  CheckIcon,
  CheckCheckIcon,
  ClockIcon,
  ImageIcon,
  ExternalLinkIcon,
} from "lucide-react";

interface Props {
  message: MessageType;
  onReply: (message: MessageType) => void;
  isGroup?: boolean;
}

export const ChatBodyMessage = memo(
  ({ message, onReply, isGroup = false }: Props) => {
    const { user } = useAuth();
    const userId = user?._id || null;
    const isCurrentUser = message.sender?._id === userId;
    const [imageLoading, setImageLoading] = useState(true);
    const [imageError, setImageError] = useState(false);
    const [showImageModal, setShowImageModal] = useState(false);

    const replySenderName =
      message.replyTo?.sender?._id === userId
        ? "You"
        : message.replyTo?.sender?.name;

    // Helper function to render message status icon
    const getMessageStatusIcon = (status?: string) => {
      switch (status?.toLowerCase()) {
        case "sent":
          return <CheckIcon size={12} className="text-muted-foreground" />;
        case "delivered":
          return <CheckCheckIcon size={12} className="text-muted-foreground" />;
        case "read":
          return <CheckCheckIcon size={12} className="text-blue-500" />;
        default:
          return <ClockIcon size={12} className="text-muted-foreground" />;
      }
    };

    // Helper function to detect and render links
    const renderMessageContent = (content: string) => {
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const parts = content.split(urlRegex);

      return parts.map((part, index) => {
        if (urlRegex.test(part)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline break-all"
            >
              {part}
            </a>
          );
        }
        return part;
      });
    };

    const containerClass = cn(
      "group flex gap-3 py-2 px-4 hover:bg-muted/30 transition-colors",
      isCurrentUser && "flex-row-reverse"
    );

    const contentWrapperClass = cn(
      "max-w-[75%] sm:max-w-[70%] md:max-w-[60%] flex flex-col relative",
      isCurrentUser && "items-end"
    );

    const messageClass = cn(
      "px-4 py-3 text-sm break-words shadow-sm rounded-2xl",
      isCurrentUser
        ? "bg-primary text-primary-foreground rounded-br-md"
        : "bg-muted rounded-bl-md"
    );

    const replyBoxClass = cn(
      "mb-2 p-3 text-xs rounded-lg border-l-4 bg-background/80 backdrop-blur-sm",
      isCurrentUser
        ? "border-l-primary bg-primary/70"
        : "border-l-muted-foreground/50 bg-muted/50"
    );
    return (
      <div className={containerClass}>
        {!isCurrentUser && (
          <AvatarWithBadge
            name={message.sender?.name || ""}
            src={message.sender?.avatar || ""}
            className="shrink-0 mt-1"
          />
        )}

        <div className={contentWrapperClass}>
          <div className="flex flex-col gap-1">
            {/* Message with reply button beside */}
            <div className="flex items-end gap-2 group">
              <div className={messageClass}>
                <div className="flex items-center justify-between gap-2 mb-1">
                  {!isCurrentUser && (
                    <div className="text-xs font-semibold text-primary">
                      {message.sender?.name || "Unknown"}
                    </div>
                  )}
                  {isCurrentUser && (
                    <div className="text-xs font-semibold text-accent">You</div>
                  )}

                  <div className="flex items-center gap-1 ml-auto">
                    <span className="text-[.7rem]">
                      {formatChatTime(message.createdAt)}
                    </span>
                    {message.status && isCurrentUser && (
                      <div className="flex items-center">
                        {getMessageStatusIcon(message.status)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply content */}
                {message.replyTo && (
                  <div className={replyBoxClass}>
                    <div className="font-medium text-xs mb-1">
                      {replySenderName}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      {message.replyTo.image && !message.replyTo.content && (
                        <>
                          <ImageIcon size={12} />
                          <span>Photo</span>
                        </>
                      )}
                      {message.replyTo.content && (
                        <span className="truncate">
                          {message.replyTo.content.length > 50
                            ? `${message.replyTo.content.substring(0, 50)}...`
                            : message.replyTo.content}
                        </span>
                      )}
                      {message.replyTo.image && message.replyTo.content && (
                        <span className="truncate flex items-center gap-1">
                          <ImageIcon size={12} />
                          {message.replyTo.content.length > 40
                            ? `${message.replyTo.content.substring(0, 40)}...`
                            : message.replyTo.content}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Message content */}
                {message.image && (
                  <div className="mb-2">
                    <Dialog
                      open={showImageModal}
                      onOpenChange={setShowImageModal}
                    >
                      <DialogTrigger asChild>
                        <div className="relative inline-block cursor-pointer group/image">
                          {imageLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
                              <Spinner className="h-4 w-4" />
                            </div>
                          )}
                          {imageError ? (
                            <div className="flex items-center justify-center w-48 h-32 bg-muted rounded-lg border-2 border-dashed border-muted-foreground/25">
                              <div className="text-center">
                                <ImageIcon
                                  size={24}
                                  className="mx-auto mb-1 text-muted-foreground"
                                />
                                <span className="text-xs text-muted-foreground">
                                  Failed to load image
                                </span>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={message.image}
                              alt={`Image sent by ${
                                message.sender?.name || "user"
                              }`}
                              className={cn(
                                "rounded-lg max-w-full h-auto object-cover transition-all duration-200",
                                "max-w-xs sm:max-w-sm md:max-w-md",
                                "hover:opacity-90 hover:scale-[1.02]",
                                imageLoading && "opacity-0"
                              )}
                              style={{ maxHeight: "300px" }}
                              onLoad={() => setImageLoading(false)}
                              onError={() => {
                                setImageLoading(false);
                                setImageError(true);
                              }}
                              loading="lazy"
                            />
                          )}
                          {!imageError && !imageLoading && (
                            <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                              <ExternalLinkIcon
                                size={20}
                                className="text-white drop-shadow-lg"
                              />
                            </div>
                          )}
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95">
                        <div className="relative flex items-center justify-center min-h-50 max-h-[90vh]">
                          <img
                            src={message.image}
                            alt={`Image sent by ${
                              message.sender?.name || "user"
                            }`}
                            className="max-w-full max-h-full object-contain"
                            onError={() => setShowImageModal(false)}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}

                {message.content && (
                  <div className="whitespace-pre-wrap wrap-break-word">
                    {renderMessageContent(message.content)}
                  </div>
                )}
              </div>

              {/* Reply button beside message */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply(message)}
                className="h-6 w-6 p-0 hover:bg-muted rounded-full opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                aria-label={`Reply to message from ${
                  message.sender?.name || "user"
                }`}
              >
                <ReplyIcon size={14} className="text-muted-foreground" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

ChatBodyMessage.displayName = "ChatBodyMessage";
