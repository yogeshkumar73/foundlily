export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  avatar?: string;
}

export interface Profile {
  _id: string;
  ownerId: string;
  name: string;
  slug: string;
  logo: string;
  shortDescription: string;
  description: string;
  website: string;
  founder: string;
  categoryId: string;
  subCategoryId: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export interface RegionState {
  _id: string;
  name: string;
  slug: string;
  cities: string[];
}

export interface Region {
  _id: string;
  name: string;
  slug: string;
  states: RegionState[];
}
