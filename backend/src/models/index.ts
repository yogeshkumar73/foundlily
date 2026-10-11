import mongoose, { Schema, Document } from 'mongoose';

// User Schema
export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  avatar: { type: String, default: '' },
  role: { type: String, enum: ['admin', 'user'], default: 'user' },
}, { timestamps: true });

export const UserModel = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// Profile Schema
export interface IProfile extends Document {
  ownerId: string;
  name: string;
  slug: string;
  logo: string;
  shortDescription: string;
  description: string;
  website: string;
  founder: string;
  categoryId: string;
  subCategoryId?: string;
  countryId: string;
  stateId: string;
  cityId: string;
  foundedYear: number;
  stage: string;
  businessModel: string;
  teamSize: string;
  productService: string;
  socialLinks: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    discord?: string;
  };
  funding: string;
  ipInfo: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DRAFT';
  isFeatured: boolean;
  viewCount: number;
  followerCount: number;
  saveCount: number;
  trendingScore: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>({
  ownerId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  logo: { type: String, default: '' },
  shortDescription: { type: String, required: true },
  description: { type: String, required: true },
  website: { type: String, default: '' },
  founder: { type: String, default: '' },
  categoryId: { type: String, required: true, index: true },
  subCategoryId: { type: String, default: 'general' },
  countryId: { type: String, required: true, index: true },
  stateId: { type: String, required: true, index: true },
  cityId: { type: String, required: true, index: true },
  foundedYear: { type: Number, default: () => new Date().getFullYear() },
  stage: { type: String, default: 'Seed' },
  businessModel: { type: String, default: 'B2B SaaS' },
  teamSize: { type: String, default: '10' },
  productService: { type: String, default: '' },
  socialLinks: {
    twitter: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    discord: { type: String, default: '' },
  },
  funding: { type: String, default: '' },
  ipInfo: { type: String, default: '' },
  status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED', 'DRAFT'], default: 'PENDING', index: true },
  isFeatured: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
  followerCount: { type: Number, default: 0 },
  saveCount: { type: Number, default: 0 },
  trendingScore: { type: Number, default: 0, index: true },
}, { timestamps: true });

// Important indexes specified in blueprint
ProfileSchema.index({ createdAt: -1 });
ProfileSchema.index({ categoryId: 1, countryId: 1, stage: 1 });

export const ProfileModel = mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);

// Category Schema
export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  description: { type: String, default: '' },
  icon: { type: String, default: 'Cpu' },
  isActive: { type: Boolean, default: true },
});

export const CategoryModel = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

// Region Schema
export interface IRegion extends Document {
  name: string;
  slug: string;
  states: Array<{
    _id?: string;
    name: string;
    slug: string;
    cities: string[];
  }>;
}

const RegionSchema = new Schema<IRegion>({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true, index: true },
  states: [{
    name: { type: String, required: true },
    slug: { type: String, required: true },
    cities: [{ type: String }],
  }],
});

export const RegionModel = mongoose.models.Region || mongoose.model<IRegion>('Region', RegionSchema);

// Follow Schema (with compound index)
export interface IFollow extends Document {
  userId: string;
  profileId: string;
  createdAt: Date;
}

const FollowSchema = new Schema<IFollow>({
  userId: { type: String, required: true, index: true },
  profileId: { type: String, required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

FollowSchema.index({ userId: 1, profileId: 1 }, { unique: true });
export const FollowModel = mongoose.models.Follow || mongoose.model<IFollow>('Follow', FollowSchema);

// SavedProfile Schema (with compound index)
export interface ISavedProfile extends Document {
  userId: string;
  profileId: string;
  createdAt: Date;
}

const SavedProfileSchema = new Schema<ISavedProfile>({
  userId: { type: String, required: true, index: true },
  profileId: { type: String, required: true, index: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

SavedProfileSchema.index({ userId: 1, profileId: 1 }, { unique: true });
export const SavedProfileModel = mongoose.models.SavedProfile || mongoose.model<ISavedProfile>('SavedProfile', SavedProfileSchema);

// Analytics Event Schema
export interface IAnalyticsEvent extends Document {
  profileId: string;
  userId?: string;
  eventType: 'view' | 'click' | 'save' | 'follow' | 'share';
  metadata?: any;
  createdAt: Date;
}

const AnalyticsEventSchema = new Schema<IAnalyticsEvent>({
  profileId: { type: String, required: true, index: true },
  userId: { type: String, index: true },
  eventType: { type: String, required: true, enum: ['view', 'click', 'save', 'follow', 'share'] },
  metadata: { type: Schema.Types.Mixed },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const AnalyticsEventModel = mongoose.models.AnalyticsEvent || mongoose.model<IAnalyticsEvent>('AnalyticsEvent', AnalyticsEventSchema);
