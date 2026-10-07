import mongoose, { Schema, Document } from 'mongoose';

export interface ITrip extends Document {
  userId: string;
  title: string;
  destination: string;
  origin: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  travelers: any;
  budget: any;
  travelStyles: string[];
  interests: string[];
  accommodationPreference: any;
  transportPreferences: any;
  specialRequirements: any;
  transitOptions: any;
  destinationOverview: any;
  aiExplanations: string[];
  routeSequence: string[];
  routeSegments: any[];
  days: any[];
  budgetBreakdown: any;
  qualityScore: any;
  checklist: any[];
  status: 'draft' | 'generated' | 'modifying' | 'finalized';
  version: number;
  shareId: string;
  isPublic: boolean;
  agentMetadata: any;
  createdAt: Date;
  updatedAt: Date;
}

const tripSchema = new Schema<ITrip>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  destination: { type: String, required: true },
  origin: { type: String, default: 'Hyderabad' },
  startDate: String,
  endDate: String,
  durationDays: { type: Number, default: 5 },
  travelers: { type: Schema.Types.Mixed },
  budget: { type: Schema.Types.Mixed },
  travelStyles: [String],
  interests: [String],
  accommodationPreference: { type: Schema.Types.Mixed },
  transportPreferences: { type: Schema.Types.Mixed },
  specialRequirements: { type: Schema.Types.Mixed },
  transitOptions: { type: Schema.Types.Mixed },
  destinationOverview: { type: Schema.Types.Mixed },
  aiExplanations: [String],
  routeSequence: [String],
  routeSegments: [{ type: Schema.Types.Mixed }],
  days: [{ type: Schema.Types.Mixed }],
  budgetBreakdown: { type: Schema.Types.Mixed },
  qualityScore: { type: Schema.Types.Mixed },
  checklist: [{ type: Schema.Types.Mixed }],
  status: { type: String, enum: ['draft', 'generated', 'modifying', 'finalized'], default: 'generated' },
  version: { type: Number, default: 1 },
  shareId: { type: String, unique: true, sparse: true },
  isPublic: { type: Boolean, default: false },
  agentMetadata: { type: Schema.Types.Mixed },
}, {
  timestamps: true,
});

// Index for quick lookups
tripSchema.index({ userId: 1, createdAt: -1 });

export const Trip = mongoose.model<ITrip>('Trip', tripSchema);
