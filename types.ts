
export enum UserRole {
  EMPLOYEE = 'Dipendente',
  MANAGER = 'Manager',
}

export enum Department {
  PREVENDITA = 'PREVENDITA',
  HELPDESK = 'HELPDESK',
  COMMERCIALI = 'COMMERCIALI',
  MANAGEMENT = 'MANAGEMENT' // Fallback for admin
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: Department | string;
  password?: string; // Only for managers
}

export enum RequestStatus {
  PENDING = 'In Attesa',
  APPROVED = 'Approvato',
  REJECTED = 'Rifiutato',
}

export interface LeaveRequest {
  id: string;
  userId: string;
  startDate: string; // ISO Date string YYYY-MM-DD
  endDate: string;   // ISO Date string YYYY-MM-DD
  status: RequestStatus;
  reason: string;
  createdAt: number;
}

export type ViewState = 'dashboard' | 'calendar' | 'requests' | 'users' | 'settings';
