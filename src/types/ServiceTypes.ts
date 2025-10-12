import { Types } from "mongoose";

export interface ISuggestedPrice {
  min: number;
  max: number;
  currency: string; // "KES", "USD", etc.
}

export interface ISubService {
  name: string;
  description?: string;
  estimatedDuration: number; // in minutes
  suggestedPrice: ISuggestedPrice;
}

export interface IService {
  _id: Types.ObjectId;
  name: string;
  category: string;
  description?: string;
  icon?: string; // URL or icon name
  isActive: boolean;
  subServices?: ISubService[];

  createdAt?: Date;
  updatedAt?: Date;
}
