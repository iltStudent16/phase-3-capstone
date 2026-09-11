import mongoose, { Schema, type Document, type Model, type Types } from "mongoose";

export type ClaimStatus = "submitted" | "under-review" | "approved" | "denied" | "closed";

export interface IClaimNote {
  author: Types.ObjectId;
  text: string;
  createdAt: Date;
}

export interface IClaim {
  claimNumber: string;
  policy: Types.ObjectId;
  description: string;
  incidentDate: Date;
  amount: number;
  status: ClaimStatus;
  assignedTo?: Types.ObjectId;
  notes: IClaimNote[];
}

export interface IClaimDocument extends IClaim, Document {}

type ClaimModel = Model<IClaimDocument>;

interface ICounter {
  key: string;
  sequence: number;
}

const counterSchema = new Schema<ICounter>(
  {
    key: { type: String, unique: true, required: true },
    sequence: { type: Number, default: 1000 },
  },
  { versionKey: false },
);

const Counter = mongoose.models.Counter || mongoose.model<ICounter>("Counter", counterSchema);

const claimNoteSchema = new Schema<IClaimNote>(
  {
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false },
);

const claimSchema = new Schema<IClaimDocument, ClaimModel>(
  {
    claimNumber: {
      type: String,
      unique: true,
      index: true,
    },
    policy: {
      type: Schema.Types.ObjectId,
      ref: "Policy",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    incidentDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["submitted", "under-review", "approved", "denied", "closed"],
      default: "submitted",
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: {
      type: [claimNoteSchema],
      default: [],
    },
  },
  { timestamps: true },
);

claimSchema.pre("save", async function setClaimNumber() {
  if (this.claimNumber) {
    return;
  }

  const counter = await Counter.findOneAndUpdate(
    { key: "claimNumber" },
    [
      {
        $set: {
          key: "claimNumber",
          sequence: { $add: [{ $ifNull: ["$sequence", 1000] }, 1] },
        },
      },
    ],
    { upsert: true, returnDocument: "after", updatePipeline: true },
  );

  this.claimNumber = `CLM-${counter.sequence}`;
});

export const Claim = mongoose.model<IClaimDocument, ClaimModel>("Claim", claimSchema);
