import { User, UserRole, LeaveRequest, RequestStatus, Department } from './types';

// Helper to format date as YYYY-MM-DD
const fmt = (d: Date) => d.toISOString().split('T')[0];
const today = new Date();
const nextWeek = new Date(today);
nextWeek.setDate(today.getDate() + 7);
const twoWeeks = new Date(today);
twoWeeks.setDate(today.getDate() + 14);

export const MOCK_USERS: User[] = [
  { 
    id: 'u1', 
    name: 'Mario Rossi', 
    email: 'mario@azienda.it', 
    role: UserRole.MANAGER, 
    avatar: 'https://picsum.photos/seed/u1/200', 
    department: Department.MANAGEMENT,
    password: 'admin' // Simple password for demo
  },
  { id: 'u2', name: 'Luca Bianchi', email: 'luca@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u2/200', department: Department.HELPDESK },
  { id: 'u3', name: 'Giulia Verdi', email: 'giulia@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u3/200', department: Department.PREVENDITA },
  { id: 'u4', name: 'Sofia Esposito', email: 'sofia@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u4/200', department: Department.COMMERCIALI },
  { id: 'u5', name: 'Alessandro Romano', email: 'ale@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u5/200', department: Department.HELPDESK },
  { id: 'u6', name: 'Francesca Colombo', email: 'fra@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u6/200', department: Department.COMMERCIALI },
  { id: 'u7', name: 'Matteo Ricci', email: 'matteo@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u7/200', department: Department.PREVENDITA },
  { id: 'u8', name: 'Chiara Marino', email: 'chiara@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u8/200', department: Department.HELPDESK },
  { id: 'u9', name: 'Lorenzo Greco', email: 'lorenzo@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u9/200', department: Department.COMMERCIALI },
  { id: 'u10', name: 'Alice Bruno', email: 'alice@azienda.it', role: UserRole.EMPLOYEE, avatar: 'https://picsum.photos/seed/u10/200', department: Department.PREVENDITA },
];

export const INITIAL_REQUESTS: LeaveRequest[] = [
  {
    id: 'req1',
    userId: 'u2', // Luca (Helpdesk)
    startDate: fmt(today),
    endDate: fmt(nextWeek),
    status: RequestStatus.APPROVED,
    reason: 'Vacanza estiva',
    createdAt: Date.now() - 10000000,
  },
  {
    id: 'req2',
    userId: 'u5', // Alessandro (Helpdesk) - CONFLICT TEST
    startDate: fmt(today),
    endDate: fmt(new Date(today.getTime() + 86400000 * 2)), 
    status: RequestStatus.PENDING,
    reason: 'Visita medica',
    createdAt: Date.now() - 500000,
  },
  {
    id: 'req3',
    userId: 'u4', // Sofia (Commerciali)
    startDate: fmt(nextWeek),
    endDate: fmt(twoWeeks),
    status: RequestStatus.PENDING,
    reason: 'Matrimonio sorella',
    createdAt: Date.now() - 200000,
  },
];