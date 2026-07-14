import mongoose, {Schema} from 'mongoose'

const preRegisteredUserSchema = new Schema(
  {

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    otp: {
      type: Number,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


    // Indexes
    preRegisteredUserSchema.index({ email: 1 });
export const PreRegisteredUser = mongoose.model("PreRegisteredUser", preRegisteredUserSchema);
