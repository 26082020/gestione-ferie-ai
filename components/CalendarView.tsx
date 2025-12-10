import React, { useMemo, useState } from 'react';
import { User, LeaveRequest, RequestStatus } from '../types';

interface CalendarViewProps {
  requests: LeaveRequest[];
  users: User[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ requests, users }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const monthName = currentDate.toLocaleString('it-IT', { month: 'long', year: 'numeric' });

  // Generate days array for current month
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const isDayOff = (day: number, req: LeaveRequest) => {
    const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const start = new Date(req.startDate);
    const end = new Date(req.endDate);
    
    // Normalize times to avoid timezone issues for simple comparison
    checkDate.setHours(0,0,0,0);
    start.setHours(0,0,0,0);
    end.setHours(0,0,0,0);

    return checkDate >= start && checkDate <= end;
  };

  // Memoize the grid data to avoid heavy recalculations
  const calendarGrid = useMemo(() => {
    return users.map(user => {
      const userRequests = requests.filter(
        r => r.userId === user.id && 
        (r.status === RequestStatus.APPROVED || r.status === RequestStatus.PENDING)
      );
      
      return {
        user,
        days: days.map(day => {
          const req = userRequests.find(r => isDayOff(day, r));
          return req ? req.status : null;
        })
      };
    });
  }, [users, requests, currentDate, days]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <h2 className="text-lg font-bold text-gray-800 capitalize">{monthName}</h2>
        <div className="flex space-x-2">
          <button onClick={handlePrevMonth} className="p-2 hover:bg-white rounded-full shadow-sm text-gray-600">
            &lt;
          </button>
          <button onClick={handleNextMonth} className="p-2 hover:bg-white rounded-full shadow-sm text-gray-600">
            &gt;
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-48">
                  Dipendente
                </th>
                {days.map(d => (
                  <th key={d} className="px-1 py-3 text-center text-xs font-medium text-gray-400 w-8">
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {calendarGrid.map(({ user, days }) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="sticky left-0 z-10 bg-white px-4 py-2 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-8 w-8 rounded-full" src={user.avatar} alt="" />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.department}</div>
                      </div>
                    </div>
                  </td>
                  {days.map((status, idx) => (
                    <td key={idx} className="px-1 py-2 whitespace-nowrap text-center">
                      {status === RequestStatus.APPROVED && (
                        <div className="h-6 w-full bg-green-200 rounded-sm mx-auto" title="Approvato"></div>
                      )}
                      {status === RequestStatus.PENDING && (
                        <div className="h-6 w-full bg-yellow-100 rounded-sm mx-auto" title="In Attesa"></div>
                      )}
                      {!status && (
                        <div className="h-1 w-1 bg-gray-100 rounded-full mx-auto"></div>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
       <div className="p-4 bg-gray-50 border-t border-gray-100 flex space-x-6 text-sm">
          <div className="flex items-center"><span className="w-4 h-4 bg-green-200 rounded-sm mr-2"></span> Approvato</div>
          <div className="flex items-center"><span className="w-4 h-4 bg-yellow-100 rounded-sm mr-2"></span> In Attesa</div>
       </div>
    </div>
  );
};