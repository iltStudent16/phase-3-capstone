import bcrypt from "bcryptjs";
import mongoose, { Schema, type Document, type Model } from "mongoose";

export type UserRole = "adjuster" | "admin";

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

type UserModel = Model<IUserDocument>;

const userSchema = new Schema<IUserDocument, UserModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["adjuster", "admin"],
      default: "adjuster",
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Partial<IUser>) => {
        delete ret.password;
        return ret;
      },
    },
  },
);

userSchema.pre("save", async function hashPassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUserDocument, UserModel>("User", userSchema);
