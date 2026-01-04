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
  replyTo: MessageType | null;
  onCancelReply: () => void;
}

const ChatFooter = ({
  chatId,
  currentUserId,
  replyTo,
  onCancelReply,
}: Props) => {
  const messageSchema = z.object({
    message: z.string().optional(),
  });

  const { sendMessage } = useChat();

  const [image, setImage] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
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
    if (!values.message?.trim() && !image) {
      toast.error("Please enter a message or select an image");
      return;
    }

    setIsSending(true);
    try {
      await sendMessage({
        chatId,
        content: values.message,
        image: image || undefined,
        replyTo: replyTo,
      });

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
    } finally {
      setIsSending(false);
    }
  };

  return (
    <>
      <div className="sticky bottom-0 inset-x-0 z-999 bg-card border-t border-border py-4">
        {image && (
          <div className="max-w-6xl mx-auto px-8.5 ">
            <div className="relative w-fit">
              <img
                src={image}
                alt=""
                className="object-contain h-16 bg-muted min-w-16"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className=" absolute top-1 right-1 bg-black/50 text-white rounded-full"
                onClick={handleRemoveImage}
                disabled={isSending}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="max-w-6xl px-8.5 mx-auto flex gap-2"
          >
            <div className="flex items-end gap-1.5">
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="rounded-full flex-shrink-0"
                onClick={() => imageInputRef.current?.click()}
                disabled={isSending}
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                ref={imageInputRef}
                onChange={handleImageChange}
                disabled={isSending}
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
                    className="bg-background min-h-10 max-h-32 resize-none overflow-hidden"
                    disabled={isSending}
                    onChange={handleTextareaChange}
                    onKeyDown={handleKeyDown}
                  />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              size="icon"
              className="rounded-lg cursor-pointer flex-shrink-0 self-end"
              disabled={isSending}
            >
              {isSending ? (
                <Spinner className="h-3.5 w-3.5" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
            </Button>
          </form>
        </Form>
      </div>

      {replyTo && (
        <ChatReplyBar
          replyTo={replyTo}
          currentUserId={currentUserId}
          onCancel={onCancelReply}
        />
      )}
    </>
  );
};

export default ChatFooter;
