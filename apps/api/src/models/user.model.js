import mongoose, {Schema} from 'mongoose'
import bcrypt from 'bcrypt'

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    profilePicture: {
      type: String,
      default: null,
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
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    emailOtp: {
      type: String,
      select: false,
      default: null,
    },

    emailOtpExpiresAt: {
      type: Date,
      select: false,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    lastLoginAt: {
      type: Date,
    },

    passwordChangedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);


// Indexes
userSchema.index({ username: 1 });

// hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password
userSchema.methods.isPasswordCorrect = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
}

export const User = mongoose.model("User", userSchema);