import type { MessageType } from "@/types/chat-types";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "../ui/button";
import { Paperclip, Send, X } from "lucide-react";
import { Form, FormField, FormItem } from "../ui/form";
import { Textarea } from "../ui/textarea";
import ChatReplyBar from "./chat-reply-bar";
import { useChat } from "@/hooks/use-chat";
import { Spinner } from "../ui/spinner";

interface Props {
  chatId: string;
  currentUserId: string | null;
  replyTo?: MessageType | null;
  onCancelReply: () => void;
  isAiChat: boolean;
}

const ChatFooter = ({
  chatId,
  currentUserId,
  replyTo,
  onCancelReply,
  isAiChat,
}: Props) => {
  const messageSchema = z.object({
    message: z.string().optional(),
  });

  const { sendMessage, isSendingMsg } = useChat();

  const [image, setImage] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const form = useForm({
    resolver: zodResolver(messageSchema),
    defaultValues: {
      message: "",
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`; // Max 128px (8rem)
    form.setValue("message", e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const onSubmit = async (values: { message?: string }) => {
    if (isSendingMsg) return;
    if (!values.message?.trim() && !image) {
      toast.error("Please enter a message or select an image");
      return;
    }

    try {
      const payload = {
        chatId,
        content: values.message?.trim() || undefined,
        image: image || undefined,
        replyTo: replyTo || null,
      };

      sendMessage(payload, isAiChat);

      // Only reset form and clear state on success
      onCancelReply();
      handleRemoveImage();
      form.reset();
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="z-50 sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border">
      {replyTo && !isSendingMsg && (
        <ChatReplyBar
          replyTo={replyTo}
          currentUserId={currentUserId}
          onCancel={onCancelReply}
        />
      )}

      <div className="py-4">
        {image && !isSendingMsg && (
          <div className="px-8.5 mb-3">
            <div className="relative w-fit">
              <img
                src={image}
                alt=""
                className="object-contain h-16 bg-muted min-w-16 rounded-md border border-border/40"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 size-5 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-full shadow-lg"
                onClick={handleRemoveImage}
                disabled={isSendingMsg}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit(onSubmit)();
            }}
            className="px-8.5 flex gap-2"
          >
            <div className="flex items-end gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-lg shrink-0 h-10 w-10 border-border/40 hover:bg-muted/50 transition-colors"
                onClick={() => imageInputRef.current?.click()}
                disabled={isSendingMsg}
              >
                <Paperclip className="h-4.5 w-4.5 text-muted-foreground" />
              </Button>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageChange}
                disabled={isSendingMsg}
              />
            </div>

            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Textarea
                    {...field}
                    ref={textareaRef}
                    autoComplete="off"
                    placeholder="Type new message"
                    className="bg-muted/30 border-border/40 min-h-10 max-h-32 resize-none overflow-hidden focus-visible:ring-1 focus-visible:ring-primary/20 transition-all rounded-xl py-2.5"
                    disabled={isSendingMsg}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                  />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="icon"
              className="rounded-xl cursor-pointer shrink-0 self-end h-10 w-10 bg-primary hover:bg-primary/90 shadow-md shadow-primary/10 transition-all active:scale-95"
              disabled={isSendingMsg}
            >
              {isSendingMsg ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ChatFooter;
