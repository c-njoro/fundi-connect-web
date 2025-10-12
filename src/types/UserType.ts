import { Types } from "mongoose";
import { IService } from "./ServiceTypes";

export interface IUser {
  _id: Types.ObjectId;
  email?: string;
  phone?: string;
  role: "customer" | "fundi" | "both" | "admin";

  profile: {
    firstName: string;
    lastName: string;
    avatar?: string | null;
    dateOfBirth?: Date;
    gender?: "male" | "female" | "other" | null;
    languages?: string[];
    isVerified: boolean;
    verificationDocuments?: {
      type: string;
      url: string;
      status: "pending" | "approved" | "rejected";
      uploadedAt: Date;
    }[];
  };

  location?: {
    county?: string;
    city?: string;
    area?: string;
    coordinates?: {
      type?: "Point";
      coordinates?: [number, number]; // [longitude, latitude]
    };
  };

  // Only when role includes 'fundi'
  fundiProfile?: {
    services?: (Types.ObjectId | IService)[]; // Array of service IDs
    experience?: number;
    bio?: string;

    portfolio?: {
      title: string;
      description?: string;
      images?: string[];
      completedDate?: Date;
    }[];

    availability?: {
      schedule?: {
        monday?: ScheduleDay;
        tuesday?: ScheduleDay;
        wednesday?: ScheduleDay;
        thursday?: ScheduleDay;
        friday?: ScheduleDay;
        saturday?: ScheduleDay;
        sunday?: ScheduleDay;
      };
      currentStatus?: "available" | "busy" | "offline";
      lastUpdated?: Date;
    };

    pricing?: {
      serviceId: Types.ObjectId;
      rateType: "hourly" | "fixed" | "negotiable";
      minRate: number;
      maxRate?: number;
      currency?: string;
    }[];

    ratings?: {
      average: number;
      totalReviews: number;
    };

    completedJobs?: number;
    cancelledJobs?: number;

    certifications?: {
      name: string;
      issuedBy?: string;
      dateIssued?: Date;
      expiryDate?: Date;
      certificateUrl?: string;
      verified?: boolean;
    }[];

    profileStatus?: "draft" | "pending_review" | "approved" | "suspended" | "rejected";
    applicationDate?: Date;
    approvedDate?: Date;
    rejectionReason?: string;
    suspensionReason?: string;
  };


  isFundi: boolean;
  isCustomer: boolean;
  
  isActive: boolean;
  lastLogin?: Date;
  emailVerified: boolean;
  phoneVerified: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface ScheduleDay {
  available?: boolean;
  hours?: {
    start?: string;
    end?: string;
  };
}
