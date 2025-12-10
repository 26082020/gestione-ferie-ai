import React, { useState } from 'react';
import { User, LeaveRequest, RequestStatus, UserRole } from '../types';
import { api } from '../services/api';

interface DashboardProps {
  requests: LeaveRequest[];
  currentUser: User;
  users: User[];
}

export const Dashboard: React.FC<DashboardProps> = ({ requests, currentUser, users }) => {
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const pendingCount = requests.filter(r => r.status === RequestStatus.PENDING).length;
  const approvedCount = requests.filter(r => r.status === RequestStatus.APPROVED).length;
  const myRequests = requests.filter(r => r.userId === currentUser.id);

  const handleAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const result = await api.analyzeConflicts(requests, users);
      setAiAnalysis(result);
    } catch (e) {
      setAiAnalysis("Errore durante l'analisi.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Benvenuto, {currentUser.name}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Le mie Ferie</h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">{myRequests.length}</p>
          <p className="text-sm text-gray-400 mt-1">Richieste totali</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Stato Richieste</h3>
          <div className="mt-2 flex items-center space-x-4">
             <div className="text-center">
                <span className="block text-2xl font-bold text-yellow-500">{pendingCount}</span>
                <span className="text-xs text-gray-400">In Attesa</span>
             </div>
             <div className="h-8 w-px bg-gray-200"></div>
             <div className="text-center">
                <span className="block text-2xl font-bold text-green-500">{approvedCount}</span>
                <span className="text-xs text-gray-400">Approvate</span>
             </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-xl shadow-md text-white">
          <h3 className="text-indigo-100 text-sm font-medium uppercase">AI Assistant</h3>
          <p className="mt-2 text-sm opacity-90">
            {currentUser.role === UserRole.MANAGER 
              ? "Analizza i conflitti di programmazione con Gemini." 
              : "Visualizza i suggerimenti per le tue ferie."}
          </p>
          {currentUser.role === UserRole.MANAGER && (
            <button 
              onClick={handleAiAnalysis}
              disabled={loadingAi}
              className="mt-4 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-semibold transition backdrop-blur-sm flex items-center"
            >
              {loadingAi ? (
                <span className="animate-pulse">Analisi in corso...</span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Analizza Calendario
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {aiAnalysis && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600 mr-3">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
               </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Analisi AI Gemini</h3>
          </div>
          <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line">
            {aiAnalysis}
          </div>
        </div>
      )}
    </div>
  );
};