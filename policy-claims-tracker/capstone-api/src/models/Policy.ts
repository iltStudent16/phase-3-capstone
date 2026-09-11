import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type PolicyType = "auto" | "home" | "life";
export type PolicyStatus = "active" | "expired" | "cancelled";

export interface IPolicy {
  policyNumber: string;
  holderName: string;
  type: PolicyType;
  premium: number;
  status: PolicyStatus;
  effectiveDate: Date;
  expirationDate: Date;
  owner: Types.ObjectId;
}

export interface IPolicyDocument extends IPolicy, Document {}

type PolicyModel = Model<IPolicyDocument>;

const policySchema = new Schema<IPolicyDocument, PolicyModel>(
  {
    policyNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    holderName: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["auto", "home", "life"],
      required: true,
    },
    premium: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "expired", "cancelled"],
      default: "active",
    },
    effectiveDate: {
      type: Date,
      required: true,
    },
    expirationDate: {
      type: Date,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

export const Policy = mongoose.model<IPolicyDocument, PolicyModel>("Policy", policySchema);
