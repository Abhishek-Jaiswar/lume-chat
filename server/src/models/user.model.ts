import mongoose, { Schema, Document } from "mongoose";
import { CompareValue, hashValue } from "../utils/bcrypt";

export interface UserDocument extends Document {
  name: string;
  email?: string;
  password?: string;
  avatar?: string | null;
  isAi: boolean;
  createdAt: Date;
  updatedAt: Date;

  comparePassword(val: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true,
      required: function (this: UserDocument) {
        return !this.isAi;
      },
    },
    password: {
      type: String,
      required: function (this: UserDocument) {
        return !this.isAi;
      },
    },
    avatar: {
      type: String,
      default: null,
    },
    isAi: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        if (ret) {
          delete (ret as any).password;
        }
        return ret;
      },
    },
  }
);

userSchema.pre("save", async function () {
  if (this.password && this.isModified("password")) {
    this.password = await hashValue(this.password);
  }
});

userSchema.methods.comparePassword = async function (
  val: string
): Promise<boolean> {
  return CompareValue(val, this.password);
};

export const User = mongoose.model<UserDocument>("User", userSchema);
