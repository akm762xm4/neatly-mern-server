import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export interface IRefreshToken {
  tokenHash: string;
  createdAt: Date;
  expiresAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  refreshTokens: IRefreshToken[];
  comparePassword(password: string): Promise<boolean>;
  addRefreshToken(token: string, expiresAt?: Date): Promise<void>;
  removeRefreshTokenByHash(tokenHash: string): Promise<void>;
  createdAt: Date;
  updatedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  tokenHash: { type: String, required: true },
  createdAt: { type: Date, default: () => new Date() },
  expiresAt: { type: Date },
});

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String },
    refreshTokens: { type: [RefreshTokenSchema], default: [] },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.methods.addRefreshToken = async function (
  token: string,
  expiresAt?: Date
) {
  const saltRounds = 10;
  const tokenHash = await bcrypt.hash(token, saltRounds);
  this.refreshTokens.push({ tokenHash, createdAt: new Date(), expiresAt });
  await this.save();
};

UserSchema.methods.removeRefreshTokenByHash = async function (
  tokenHash: string
) {
  this.refreshTokens = this.refreshTokens.filter(
    (rt: IRefreshToken) => rt.tokenHash !== tokenHash
  );
  await this.save();
};

// Before saving, if passwordHash looks like a plain password, hash it
UserSchema.pre("save", async function (next) {
  // If passwordHash is already a bcrypt hash it will start with $2
  if (this.isModified("passwordHash")) {
    const hash = this.passwordHash;
    if (!hash.startsWith("$2")) {
      const saltRounds = 10;
      this.passwordHash = await bcrypt.hash(hash, saltRounds);
    }
  }
  next();
});

export const User = mongoose.model<IUser>("User", UserSchema);
