import mongoose, { Document, Schema } from "mongoose";

export interface ChatDocument extends Document {
  participants: mongoose.Types.ObjectId[];
  lastMessage: mongoose.Types.ObjectId;
  isGroup: boolean;
  groupName: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<ChatDocument>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
    isGroup: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    groupName: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const Chat = mongoose.model<ChatDocument>("Chat", chatSchema);
