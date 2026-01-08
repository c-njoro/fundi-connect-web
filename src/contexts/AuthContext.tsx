// src/contexts/AuthContext.tsx
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/router";
import apiClient from "@/lib/api/client";
import { authService } from "@/lib/api/services";

interface User {
  _id: string;
  id?: string; // duplicate from backend
  email: string;
  phone?: string;
  role: string;

  profile: {
    firstName: string;
    lastName: string;
    fullName?: string;
    avatar?: string;
    gender?: string;
    languages?: string[];
    isVerified?: boolean;
    verificationDocuments?: {
      type: string;
      url: string;
      status: string;
      uploadedAt: Date;
    }[];
    dateOfBirth?: string;
  };

  location?: {
    coordinates?: {
      type?: string;
      coordinates?: number[];
    };
    county?: string;
    city?: string;
    area?: string;
  };

  fundiProfile?: {
    availability?: {
      schedule?: {
        monday?: {
          hours?: { start?: string; end?: string };
          available?: boolean;
        };
        tuesday?: {
          hours?: { start?: string; end?: string };
          available?: boolean;
        };
        wednesday?: {
          hours?: { start?: string; end?: string };
          available?: boolean;
        };
        thursday?: {
          hours?: { start?: string; end?: string };
          available?: boolean;
        };
        friday?: {
          hours?: { start?: string; end?: string };
          available?: boolean;
        };
        saturday?: {
          hours?: { start?: string; end?: string };
          available?: boolean;
        };
        sunday?: {
          hours?: { start?: string; end?: string };
          available?: boolean;
        };
      };
      currentStatus?: string;
      lastUpdated?: string;
    };

    ratings?: {
      average?: number;
      totalReviews?: number;
    };

    services?: string[];
    experience?: number;
    bio?: string;

    portfolio?: {
      title?: string;
      description?: string;
      images?: string[];
      completedDate?: string;
    }[];

    pricing?: {
      serviceId?: string;
      rateType?: string;
      minRate?: number;
      maxRate?: number;
      currency?: string;
    }[];

    certifications?: {
      name?: string;
      issuedBy?: string;
      dateIssued?: string;
      expiryDate?: string;
      certificateUrl?: string;
      verified?: boolean;
    }[];

    profileStatus?: string;
    applicationDate?: string;
    approvedDate?: string;
    cancelledJobs?: number;
    completedJobs?: number;
    suspensionReason?: string;
  };

  isFundi?: boolean;
  isCustomer?: boolean;

  isActive?: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;

  __v?: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (phone: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (phone: string, password: string) => {
    try {
      const response = await apiClient.post("/users/login", {
        phone,
        password,
      });
      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);

      // Redirect based on role
      if (user.role === "admin") {
        router.push("/dashboard");
      } else if (user.isFundi) {
        router.push("/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (data: any) => {
    // Use authService which returns a normalized response (no throw on 4xx)
    const res = await authService.register(data);
    if (res?.success && res.data) {
      const { token, user } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setToken(token);
      setUser(user);
      router.push("/dashboard/customer");
      return;
    }

    // For failure, throw a friendly Error so callers can show an appropriate message
    throw new Error(res?.message || "Registration failed");
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
