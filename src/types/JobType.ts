import { Types } from "mongoose";
import { IUser } from "./UserType";
import { IService } from "./ServiceTypes";

// ------------------------
// Sub-schemas Types
// ------------------------

export interface IEstimatedBudget {
  min: number;
  max: number;
  currency?: string; // default: 'KES'
}

export interface ILocationCoordinates {
  lat?: number;
  lng?: number;
}

export interface ILocation {
  address?: string;
  county?: string;
  city?: string;
  area?: string;
  coordinates?: ILocationCoordinates;
  landmark?: string;
}

export interface IScheduling {
  preferredDate?: Date;
  preferredTime?: string; // "14:30"
  flexibility?: "flexible" | "strict";
  scheduledDateTime?: Date;
}

export interface IProposal {
  fundiId: string | IUser;
  proposedPrice: number;
  estimatedDuration: number; // minutes or hours
  proposal?: string;
  appliedAt?: Date;
  status: "pending" | "accepted" | "rejected";
}

export interface IPayment {
  method: "mpesa" | "card" | "cash";
  status: "pending" | "escrow" | "released" | "refunded";
  transactionId?: string;
  escrowAmount?: number;
  releaseDate?: Date;
}

export interface IWorkProgress {
  updateBy: string | IUser;
  message?: string;
  images?: string[];
  timestamp?: Date;
  stage: "started" | "in_progress" | "completed";
}

export interface ICompletion {
  completedAt?: Date;
  completionImages?: string[];
  customerApproved?: boolean;
  completionNotes?: string;
}

// ------------------------
// Job Details
// ------------------------

export interface IJobDetails {
  title: string;
  description?: string;
  images?: string[];
  urgency: "low" | "medium" | "high" | "emergency";
  estimatedBudget?: IEstimatedBudget;
}

// ------------------------
// Main Job Interface
// ------------------------

export interface IJob {
  _id: string;

  customerId: string | IUser;
  fundiId?: string | IUser;
  serviceId: string | IService;

  subService: string;

  jobDetails: IJobDetails;

  location?: ILocation;
  scheduling?: IScheduling;

  status:
    | "posted"
    | "applied"
    | "assigned"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "disputed";

  proposals?: IProposal[];

  agreedPrice?: number;
  actualPrice?: number;

  payment?: IPayment;

  workProgress?: IWorkProgress[];

  completion?: ICompletion;

  createdAt: Date;
  updatedAt: Date;
}
