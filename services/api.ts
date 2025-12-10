
import { User, LeaveRequest, RequestStatus } from '../types';

const API_URL = '/api'; // Relative path works because frontend is served by backend

export const api = {
  // USERS
  getUsers: async (): Promise<User[]> => {
    const res = await fetch(`${API_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return res.json();
  },

  createUser: async (user: User): Promise<void> => {
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) throw new Error('Failed to create user');
  },

  login: async (email: string, password: string | undefined, role: string): Promise<User> => {
    const res = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    return res.json();
  },

  // REQUESTS
  getRequests: async (): Promise<LeaveRequest[]> => {
    const res = await fetch(`${API_URL}/requests`);
    if (!res.ok) throw new Error('Failed to fetch requests');
    return res.json();
  },

  createRequest: async (req: LeaveRequest): Promise<void> => {
    const res = await fetch(`${API_URL}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req)
    });
    if (!res.ok) throw new Error('Failed to create request');
  },

  updateRequestStatus: async (id: string, status: RequestStatus): Promise<void> => {
    const res = await fetch(`${API_URL}/requests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error('Failed to update status');
  },
  
  // ADMIN
  resetDatabase: async (): Promise<void> => {
    const res = await fetch(`${API_URL}/admin/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset database');
  },
  
  // AI ANALYSIS
  analyzeConflicts: async (requests: LeaveRequest[], users: User[]): Promise<string> => {
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requests, users })
    });
    if (!res.ok) return "Impossibile completare l'analisi al momento.";
    const data = await res.json();
    return data.analysis;
  },

  // NOTIFICATIONS (Direct Helper)
  sendNotification: async (to: string, subject: string, body: string): Promise<void> => {
    await fetch(`${API_URL}/notify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, body })
    });
  }
};
