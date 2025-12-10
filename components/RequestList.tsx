import React from 'react';
import { LeaveRequest, RequestStatus, User, UserRole, Department } from '../types';

interface RequestListProps {
  requests: LeaveRequest[];
  currentUser: User;
  users: User[];
  onUpdateStatus: (id: string, status: RequestStatus) => void;
}

export const RequestList: React.FC<RequestListProps> = ({ requests, currentUser, users, onUpdateStatus }) => {
  const isManager = currentUser.role === UserRole.MANAGER;

  // Filter requests
  const filteredRequests = isManager 
    ? [...requests].sort((a, b) => {
        if (a.status === RequestStatus.PENDING && b.status !== RequestStatus.PENDING) return -1;
        if (a.status !== RequestStatus.PENDING && b.status === RequestStatus.PENDING) return 1;
        return b.createdAt - a.createdAt;
      })
    : requests.filter(r => r.userId === currentUser.id).sort((a, b) => b.createdAt - a.createdAt);

  // Check conflicts helper
  const checkConflicts = (req: LeaveRequest, requester: User): string[] => {
    if (req.status === RequestStatus.REJECTED || requester.department === Department.MANAGEMENT) return [];
    
    const conflicts: string[] = [];
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);

    // Find other approved or pending requests in same department
    const deptRequests = requests.filter(r => {
      const u = users.find(user => user.id === r.userId);
      return u && u.department === requester.department && u.id !== requester.id && 
             (r.status === RequestStatus.APPROVED || r.status === RequestStatus.PENDING);
    });

    deptRequests.forEach(otherReq => {
      const otherStart = new Date(otherReq.startDate);
      const otherEnd = new Date(otherReq.endDate);

      // Check overlap
      if (start <= otherEnd && end >= otherStart) {
         const otherUser = users.find(u => u.id === otherReq.userId);
         if (otherUser) {
           conflicts.push(`${otherUser.name} (${otherReq.status})`);
         }
      }
    });

    return conflicts;
  };

  if (filteredRequests.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl shadow-sm">
        <p className="text-gray-500">Nessuna richiesta trovata.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredRequests.map(req => {
        const requester = users.find(u => u.id === req.userId);
        if (!requester) return null;

        const conflicts = checkConflicts(req, requester);
        const hasConflicts = conflicts.length > 0;

        return (
          <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div className="flex items-start space-x-4">
                <img src={requester.avatar} alt={requester.name} className="w-12 h-12 rounded-full object-cover shadow-sm" />
                <div>
                    <h4 className="text-lg font-bold text-gray-800">{requester.name}</h4>
                    <p className="text-sm text-gray-500">{requester.department} &bull; {req.reason}</p>
                    <div className="flex items-center mt-2 space-x-3 text-sm">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {new Date(req.startDate).toLocaleDateString('it-IT')} &rarr; {new Date(req.endDate).toLocaleDateString('it-IT')}
                    </span>
                    <span className={`px-2 py-1 rounded font-medium ${
                        req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-700' :
                        req.status === RequestStatus.REJECTED ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                    }`}>
                        {req.status}
                    </span>
                    </div>
                </div>
                </div>

                {isManager && req.status === RequestStatus.PENDING && (
                <div className="flex space-x-2 mt-4 md:mt-0 w-full md:w-auto">
                    <button
                    onClick={() => onUpdateStatus(req.id, RequestStatus.APPROVED)}
                    className="flex-1 md:flex-none px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-medium shadow-sm shadow-green-200"
                    >
                    Approva
                    </button>
                    <button
                    onClick={() => onUpdateStatus(req.id, RequestStatus.REJECTED)}
                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                    >
                    Rifiuta
                    </button>
                </div>
                )}
                
                {!isManager && (
                    <div className="text-xs text-gray-400 mt-2 md:mt-0">
                        ID: {req.id}
                    </div>
                )}
            </div>
            
            {/* Conflict Warning Block */}
            {hasConflicts && (isManager || req.userId === currentUser.id) && req.status !== RequestStatus.REJECTED && (
                <div className="bg-orange-50 border-l-4 border-orange-400 p-3 rounded text-sm text-orange-800 animate-in fade-in">
                    <p className="font-bold flex items-center">
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        Attenzione: Sovrapposizione Reparto {requester.department}
                    </p>
                    <p className="mt-1 ml-6">
                        Altri colleghi assenti: {conflicts.join(', ')}.
                        {isManager ? ' Controlla la copertura prima di approvare.' : ' Il manager potrebbe non approvare.'}
                    </p>
                </div>
            )}
          </div>
        );
      })}
    </div>
  );
};