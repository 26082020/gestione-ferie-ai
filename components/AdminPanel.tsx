
import React, { useState } from 'react';
import { User, LeaveRequest } from '../types';

interface AdminPanelProps {
  requests: LeaveRequest[];
  users: User[];
  onResetDb: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ requests, users, onResetDb }) => {
  const [confirmReset, setConfirmReset] = useState(false);

  const downloadCSV = () => {
    // Header
    let csvContent = "data:text/csv;charset=utf-8,ID Richiesta,Dipendente,Email,Reparto,Data Inizio,Data Fine,Stato,Motivazione\n";
    
    // Rows
    requests.forEach(req => {
      const user = users.find(u => u.id === req.userId);
      if (user) {
        const row = [
          req.id,
          user.name,
          user.email,
          user.department,
          req.startDate,
          req.endDate,
          req.status,
          `"${req.reason.replace(/"/g, '""')}"` // Escape quotes
        ].join(",");
        csvContent += row + "\n";
      }
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `report_ferie_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Export Data Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-2">Esportazione Dati</h3>
        <p className="text-gray-500 text-sm mb-4">Scarica un report completo di tutte le richieste di ferie in formato CSV compatibile con Excel.</p>
        <button 
          onClick={downloadCSV}
          className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition flex items-center font-medium"
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Scarica CSV Ferie
        </button>
      </div>

      {/* Database Management Section */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
        <h3 className="text-lg font-bold text-red-700 mb-2">Zona Pericolosa - Gestione Database</h3>
        <p className="text-gray-500 text-sm mb-4">
          Qui puoi resettare completamente il database, cancellando tutte le richieste e gli utenti creati, riportando l'app allo stato iniziale (Demo). 
          <br/><strong>Attenzione: questa azione è irreversibile.</strong>
        </p>

        {!confirmReset ? (
           <button 
             onClick={() => setConfirmReset(true)}
             className="bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-100 transition font-medium"
           >
             Reset Database (Cancella Tutto)
           </button>
        ) : (
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 animate-in fade-in">
             <p className="text-red-800 font-bold mb-2">Sei sicuro? Tutti i dati verranno persi.</p>
             <div className="flex space-x-3">
               <button 
                 onClick={onResetDb}
                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
               >
                 Sì, Cancella Tutto
               </button>
               <button 
                 onClick={() => setConfirmReset(false)}
                 className="bg-white text-gray-700 px-4 py-2 rounded border hover:bg-gray-50 transition"
               >
                 Annulla
               </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};
