import type { MessageType } from "@/types/chat-types";
import { Button } from "../ui/button";
import { X } from "lucide-react";

interface Props {
  replyTo: MessageType | null;
  currentUserId: string | null;
  onCancel: () => void;
}

const ChatReplyBar = ({ replyTo, currentUserId, onCancel }: Props) => {
  const senderName =
    replyTo?.sender?._id === currentUserId ? "You" : replyTo?.sender?.name;

  return (
    <div className="w-full border-t border-border/40 animate-in slide-in-from-bottom-2 bg-background/95 backdrop-blur-md px-6 py-2">
      <div className="flex items-center justify-between p-2.5 text-sm border-l-4 border-l-primary bg-primary/5 rounded-lg shadow-sm">
        <div className="flex-1 min-w-0 pr-4">
          <h5 className="font-bold text-primary text-[11px] uppercase tracking-wider mb-0.5">
            Replying to {senderName}
          </h5>
          {replyTo?.image ? (
            <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
              <img src={replyTo.image} alt="Attachment" className="size-8 object-cover rounded" />
              <span>Attachment</span>
            </div>
          ) : (
            <p className="truncate text-foreground/80 text-[13px] leading-snug">
              {replyTo?.content}
            </p>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          className="shrink-0 size-7 hover:bg-primary/10 rounded-full transition-colors"
        >
          <X size={15} className="text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
};

export default ChatReplyBar;
