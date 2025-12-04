import mongoose, { Document, Schema, Types, Model } from "mongoose";

export interface ChatDocument extends Document {
  participants: Types.ObjectId[]; 
  lastMessage: Types.ObjectId | null;
  isGroup: boolean; 
  groupName?: string;
  createdBy: Types.ObjectId;
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
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    groupName: {
      type: String,
      required: function (this: ChatDocument) {
        return this.isGroup;
      },
    },
  },
  { timestamps: true }
);

export const Chat: Model<ChatDocument> = mongoose.model<ChatDocument>(
  "Chat",
  chatSchema
);
