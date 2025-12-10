
import React, { useState, useEffect } from 'react';
import { User, LeaveRequest, RequestStatus, ViewState, UserRole } from './types';
import { Dashboard } from './components/Dashboard';
import { CalendarView } from './components/CalendarView';
import { RequestList } from './components/RequestList';
import { Login } from './components/Login';
import { UserManagement } from './components/UserManagement';
import { MANAGER_EMAIL } from './services/emailService';
import { api } from './services/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  
  const [view, setView] = useState<ViewState>('dashboard');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Fetch initial data
  const refreshData = async () => {
    try {
      setLoading(true);
      const [fetchedUsers, fetchedRequests] = await Promise.all([
        api.getUsers(),
        api.getRequests()
      ]);
      setUsers(fetchedUsers);
      setRequests(fetchedRequests);
    } catch (error) {
      console.error("Error fetching data:", error);
      showNotification("Errore nel caricamento dei dati.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  // New Request Form State
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // --- Logic Helpers ---

  const handleUpdateStatus = async (id: string, status: RequestStatus) => {
    // Optimistic UI Update
    const oldRequests = [...requests];
    setRequests(prev => prev.map(req => req.id === id ? { ...req, status } : req));
    
    try {
      await api.updateRequestStatus(id, status);
      showNotification(`Stato aggiornato a ${status}`);
    } catch (error) {
      setRequests(oldRequests); // Revert on fail
      showNotification("Errore nell'aggiornamento.");
    }
  };

  const handleAddUser = async (newUser: User) => {
    try {
      await api.createUser(newUser);
      showNotification("Utente creato con successo!");
      refreshData();
    } catch (error) {
      showNotification("Errore creazione utente.");
    }
  };

  const checkConflictsOnSubmit = (startStr: string, endStr: string): boolean => {
    if (!currentUser) return false;
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    const conflicts = requests.filter(r => {
      const u = users.find(user => user.id === r.userId);
      if (!u || u.id === currentUser.id || u.department !== currentUser.department) return false;
      if (r.status === RequestStatus.REJECTED) return false;

      const rStart = new Date(r.startDate);
      const rEnd = new Date(r.endDate);
      return start <= rEnd && end >= rStart;
    });

    if (conflicts.length > 0) {
      setConflictWarning(`Attenzione! Ci sono ${conflicts.length} colleghi del reparto ${currentUser.department} già in ferie in questo periodo.`);
      return true;
    }
    setConflictWarning(null);
    return false;
  };

  useEffect(() => {
    if (startDate && endDate && showNewRequestModal) {
      checkConflictsOnSubmit(startDate, endDate);
    } else {
      setConflictWarning(null);
    }
  }, [startDate, endDate, showNewRequestModal]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const newReq: LeaveRequest = {
      id: `req_${Date.now()}`,
      userId: currentUser.id,
      startDate,
      endDate,
      status: RequestStatus.PENDING,
      reason,
      createdAt: Date.now(),
    };
    
    try {
      await api.createRequest(newReq);
      setShowNewRequestModal(false);
      setStartDate('');
      setEndDate('');
      setReason('');
      setConflictWarning(null);
      showNotification(`Richiesta inviata! Notifica email spedita a ${MANAGER_EMAIL}`);
      refreshData();
    } catch (error) {
      showNotification("Errore nell'invio della richiesta.");
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleLogin = async (email: string, password: string | undefined, role: string) => {
      try {
        const user = await api.login(email, password, role);
        setCurrentUser(user);
      } catch (err: any) {
         throw new Error(err.message);
      }
  };

  // --- RENDER ---

  if (!currentUser) {
    return <Login users={users} onLogin={(user) => setCurrentUser(user)} externalLogin={handleLogin} />;
  }

  const pendingRequestsCount = requests.filter(r => r.status === RequestStatus.PENDING).length;

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0 flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span className="w-2 h-8 bg-indigo-500 rounded-full"></span>
            FerieManager
          </h1>
          <p className="text-xs text-slate-400 mt-1 pl-4">Gestione intelligente</p>
        </div>

        <nav className="mt-6 px-4 space-y-2 flex-1">
          <button 
            onClick={() => setView('dashboard')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${view === 'dashboard' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            Dashboard
          </button>
          <button 
            onClick={() => setView('calendar')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${view === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            Calendario
          </button>
          <button 
            onClick={() => setView('requests')}
            className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors justify-between ${view === 'requests' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              Richieste
            </div>
            {currentUser.role === UserRole.MANAGER && pendingRequestsCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{pendingRequestsCount}</span>
            )}
          </button>
          
          {currentUser.role === UserRole.MANAGER && (
             <button 
             onClick={() => setView('users')}
             className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${view === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-300 hover:bg-slate-800'}`}
           >
             <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
             Gestione Utenti
           </button>
          )}
        </nav>

        {/* User Profile / Logout */}
        <div className="p-4 border-t border-slate-800">
           <div className="flex items-center mb-3">
              <img src={currentUser.avatar} alt="" className="w-8 h-8 rounded-full mr-2"/>
              <div className="overflow-hidden">
                <div className="text-sm font-medium text-white truncate">{currentUser.name}</div>
                <div className="text-xs text-slate-400 truncate">{currentUser.role}</div>
              </div>
           </div>
           <button 
             onClick={() => setCurrentUser(null)}
             className="w-full text-xs text-center py-2 border border-slate-600 rounded text-slate-300 hover:bg-slate-800 transition"
           >
             Disconnetti
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-8">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 capitalize">
                {view === 'dashboard' ? 'Dashboard' : 
                 view === 'calendar' ? 'Calendario Team' : 
                 view === 'users' ? 'Gestione Utenti' :
                 'Gestione Richieste'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('it-IT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          
          <div className="flex items-center space-x-4">
             {/* New Request Button */}
            <button 
              onClick={() => setShowNewRequestModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm shadow-indigo-200 transition flex items-center text-sm font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Nuova Richiesta
            </button>
          </div>
        </header>

        {/* Views */}
        <div className="max-w-6xl mx-auto">
          {loading && (
             <div className="text-center py-10">
               <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
               <p className="mt-2 text-gray-500">Caricamento dati...</p>
             </div>
          )}
          {!loading && view === 'dashboard' && <Dashboard requests={requests} currentUser={currentUser} users={users} />}
          {!loading && view === 'calendar' && <CalendarView requests={requests} users={users} />}
          {!loading && view === 'requests' && <RequestList requests={requests} currentUser={currentUser} users={users} onUpdateStatus={handleUpdateStatus} />}
          {!loading && view === 'users' && currentUser.role === UserRole.MANAGER && <UserManagement users={users} onAddUser={handleAddUser} />}
        </div>
      </main>

      {/* Modal New Request */}
      {showNewRequestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
               <h3 className="text-lg font-bold text-gray-800">Richiedi Ferie</h3>
               <button onClick={() => setShowNewRequestModal(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            
            <form onSubmit={handleCreateRequest} className="p-6 space-y-4">
              {conflictWarning && (
                <div className="bg-orange-50 border-l-4 border-orange-500 p-3 text-sm text-orange-700">
                  <p className="font-bold">Attenzione Possibile Conflitto</p>
                  <p>{conflictWarning}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Inizio</label>
                <input 
                  type="date" 
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Data Fine</label>
                <input 
                  type="date" 
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Motivazione</label>
                <textarea 
                  rows={3}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Es. Vacanze estive, Visita medica..."
                  className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
                ></textarea>
              </div>
              <div className="pt-2 flex space-x-3">
                <button 
                  type="button" 
                  onClick={() => setShowNewRequestModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Annulla
                </button>
                <button 
                  type="submit" 
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-lg shadow-indigo-200"
                >
                  Invia Richiesta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center animate-in slide-in-from-bottom duration-300 z-50 max-w-sm">
           <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
           <span className="text-sm">{notification}</span>
        </div>
      )}
    </div>
  );
}
