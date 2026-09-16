export interface User {
  _id: string;
  name: string;
  email: string;
  role: "adjuster" | "admin";
}

export interface Policy {
  _id: string;
  policyNumber: string;
  holderName: string;
  type: "auto" | "home" | "life";
  premium: number;
  status: "active" | "expired" | "cancelled";
  effectiveDate: string;
  expirationDate: string;
  owner: User;
  createdAt: string;
  updatedAt: string;
}

export interface ClaimNote {
  author: User;
  text: string;
  createdAt: string;
}

export interface Claim {
  _id: string;
  claimNumber: string;
  policy: Policy;
  description: string;
  incidentDate: string;
  amount: number;
  status: "submitted" | "under-review" | "approved" | "denied" | "closed";
  assignedTo?: User;
  notes: ClaimNote[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClaimsByStatusItem {
  _id: string;
  count: number;
}

export interface DashboardStats {
  totalClaims: number;
  totalPolicies: number;
  totalUsers: number;
  totalClaimAmount: number;
  claimsByStatus: ClaimsByStatusItem[];
  recentClaims: Claim[];
}
