import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import type { MessageType } from "@/types/chat-types";
import { memo, useState } from "react";
import AvatarWithBadge from "../avatar-with-badge";
import { formatChatTime } from "@/lib/helper";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Spinner } from "../ui/spinner";
import {
  ReplyIcon,
  CheckIcon,
  CheckCheckIcon,
  ClockIcon,
  ImageIcon,
  ExternalLinkIcon,
  Trash2Icon,
} from "lucide-react";
import { Response } from "../ui/ai-response";
import { useChat } from "@/hooks/use-chat";

interface Props {
  message: MessageType;
  onReply: (message: MessageType) => void;
  isGroup?: boolean;
}

export const ChatBodyMessage = memo(({ message, onReply }: Props) => {
  const { user } = useAuth();
  const userId = user?._id || null;
  const isCurrentUser = message.sender?._id === userId;
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const { deleteMessage } = useChat();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteMessage(message._id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setIsDeleting(false);
    }
  };

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

  return (
    <div
      className={cn(
        "group flex w-full py-2 px-4 hover:bg-muted/5 transition-colors",
        isCurrentUser ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex max-w-[85%] gap-3",
          isCurrentUser && "flex-row-reverse"
        )}
      >
        {!isCurrentUser && (
          <AvatarWithBadge
            name={message.sender?.name || ""}
            src={message.sender?.avatar || ""}
            className="shrink-0 mt-1"
            size="size-9"
          />
        )}

        <div
          className={cn(
            "flex flex-col gap-2 relative",
            isCurrentUser ? "items-end" : "items-start"
          )}
        >
          <div
            className={cn(
              "relative px-4 py-2.5 shadow-sm transition-colors max-w-full",
              isCurrentUser
                ? "rounded-2xl rounded-tr-none bg-primary text-primary-foreground"
                : "rounded-2xl rounded-tl-none bg-muted text-foreground"
            )}
          >
            {/* Header: Sender Info (AI only) */}
            {!isCurrentUser && (
              <div className="flex items-center gap-2 mb-1.5 border-b border-foreground/5 pb-1">
                <span className="text-[11px] font-bold text-primary tracking-tight">
                  {message.sender?.name || "Lume AI"}
                </span>
              </div>
            )}

            {/* Reply Context */}
            {message.replyTo && (
              <div
                className={cn(
                  "mb-3 p-2.5 text-[12px] rounded-lg border-l-4 bg-background/20 backdrop-blur-sm max-w-md",
                  isCurrentUser
                    ? "border-primary-foreground/40 text-primary-foreground"
                    : "border-primary/40 text-muted-foreground bg-primary/5"
                )}
              >
                <div className="font-bold mb-0.5 text-xs">
                  {replySenderName}
                </div>
                <div className="flex items-center gap-1.5 italic line-clamp-2">
                  {message.replyTo.image && (
                    <ImageIcon size={12} className="shrink-0" />
                  )}
                  <span className="truncate">
                    {message.replyTo.content || "Sent an image"}
                  </span>
                </div>
              </div>
            )}

            {/* Image Content */}
            {message.image && (
              <div className="mb-3">
                <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
                  <DialogTrigger asChild>
                    <div className="relative inline-block cursor-pointer group/image overflow-hidden rounded-xl border border-border/40 shadow-sm">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 backdrop-blur-sm">
                          <Spinner className="h-5 w-5" />
                        </div>
                      )}
                      {imageError ? (
                        <div className="flex items-center justify-center w-56 h-36 bg-muted/40 rounded-xl">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <ImageIcon size={24} />
                            <span className="text-[10px]">
                              Image unavailable
                            </span>
                          </div>
                        </div>
                      ) : (
                        <img
                          src={message.image}
                          alt="Message attachment"
                          className={cn(
                            "max-w-full h-auto object-cover transition-[filter,opacity] duration-300 hover:brightness-95",
                            "max-h-70",
                            imageLoading && "opacity-0"
                          )}
                          onLoad={() => setImageLoading(false)}
                          onError={() => {
                            setImageLoading(false);
                            setImageError(true);
                          }}
                        />
                      )}
                      {!imageError && !imageLoading && (
                        <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                          <div className="bg-background/80 p-2 rounded-full shadow-lg backdrop-blur-xs">
                            <ExternalLinkIcon
                              size={18}
                              className="text-foreground"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] p-1 border-none bg-black/90 backdrop-blur-md">
                    <img
                      src={message.image}
                      alt="Full perspective"
                      className="w-full h-full object-contain rounded-lg"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* Text Content */}
            {message.content && (
              <div
                className={cn(
                  "text-[15px] leading-relaxed wrap-break-word overflow-hidden",
                  isCurrentUser ? "text-primary-foreground" : "text-foreground"
                )}
              >
                {message.sender?.isAi ? (
                  <Response
                    className={cn(
                      isCurrentUser && "prose-invert"
                    )}
                  >
                    {message.content}
                  </Response>
                ) : (
                  <div className="whitespace-pre-wrap">{message.content}</div>
                )}
              </div>
            )}

            {/* Meta: Time & Status */}
            <div
              className={cn(
                "flex items-center gap-1.5 mt-1.5 opacity-70 text-[10px] font-bold justify-end",
                isCurrentUser && "text-primary-foreground/90"
              )}
            >
              <span>{formatChatTime(message.createdAt)}</span>
              {message.status && isCurrentUser && (
                <div className="flex items-center">
                  {getMessageStatusIcon(message.status)}
                </div>
              )}
            </div>

            {/* Typing Indicator */}
            {message.streaming && (
              <div className="flex gap-1 mt-2 justify-start opacity-80">
                <span className="size-1 rounded-full bg-current animate-bounce animation-duration-[0.8s]" />
                <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:0.2s] animation-duration-[0.8s]" />
                <span className="size-1 rounded-full bg-current animate-bounce [animation-delay:0.4s] animation-duration-[0.8s]" />
              </div>
            )}
          </div>

          {/* Inline Actions */}
          <div
            className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity absolute top-1/2 -translate-y-1/2 flex items-center gap-1",
              isCurrentUser ? "-left-20" : "-right-20"
            )}
          >
            <Button
              onClick={() => onReply(message)}
              variant="ghost"
              size="icon"
              className="size-8 rounded-full bg-background/50 hover:bg-background border shadow-xs backdrop-blur-sm"
            >
              <ReplyIcon size={14} className="text-muted-foreground" />
            </Button>

            {isCurrentUser && (
              <Dialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 rounded-full bg-background/50 hover:bg-destructive/10 hover:text-destructive border shadow-xs backdrop-blur-sm"
                    disabled={isDeleting}
                  >
                    <Trash2Icon size={14} />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Delete Message?</DialogTitle>
                    <DialogDescription>
                      This will permanently delete this message for you. This
                      action cannot be undone.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button
                      variant="ghost"
                      onClick={() => setShowDeleteDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleDelete}
                      disabled={isDeleting}
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ChatBodyMessage.displayName = "ChatBodyMessage";
