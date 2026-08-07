// Global TypeScript Interfaces for Apna Nimboda

export interface User {
  id: string;
  name: string;
  mobile: string;
  profession: string;
  subCategory?: string;
  businessName?: string;
  businessAddress?: string;
  village: string;
  password?: string;
  photoUrl?: string;
  createdAt?: string;
  deletedAt?: string;
  deleteReason?: string;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  userProfession?: string;
  content: string;
  image?: string;
  likes: number;
  likedBy?: string[];
  comments: Record<string, Comment>;
  createdAt: number;
}

export interface Comment {
  id?: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export interface Reel {
  id: string;
  userId: string;
  userName: string;
  userMobile: string;
  userProfession?: string;
  videoUrl: string;
  caption: string;
  likes: number;
  likedBy?: string[];
  shares: number;
  comments: Record<string, Comment>;
  createdAt: number;
  status: "pending" | "approved" | "rejected";
}

export interface SystemLog {
  id?: string;
  type: "error" | "warning" | "security";
  message: string;
  url: string;
  userMobile?: string;
  userId?: string;
  stack?: string;
  timestamp: number;
  ip?: string;
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  data?: T;
  message?: string;
}
