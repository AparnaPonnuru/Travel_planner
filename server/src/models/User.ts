import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  homeCity: string;
  currency: string;
  preferredTravelStyles: string[];
  dietaryRestrictions: string[];
  role: 'user' | 'admin';
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  homeCity: { type: String, default: 'Hyderabad' },
  currency: { type: String, default: 'INR' },
  preferredTravelStyles: [{ type: String }],
  dietaryRestrictions: [{ type: String }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', userSchema);
