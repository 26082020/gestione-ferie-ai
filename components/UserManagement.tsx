import React, { useState } from 'react';
import { User, UserRole, Department } from '../types';

interface UserManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
}

export const UserManagement: React.FC<UserManagementProps> = ({ users, onAddUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [department, setDepartment] = useState<Department>(Department.HELPDESK);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: `u_${Date.now()}`,
      name,
      email,
      role,
      department,
      avatar: `https://picsum.photos/seed/${email}/200`,
      password: role === UserRole.MANAGER ? password : undefined
    };
    onAddUser(newUser);
    setName('');
    setEmail('');
    setPassword('');
    alert('Utente aggiunto con successo!');
  };

  return (
    <div className="space-y-6">
       <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Aggiungi Nuovo Utente</h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
            <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded-lg p-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ruolo</label>
            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="w-full border rounded-lg p-2">
              <option value={UserRole.EMPLOYEE}>Dipendente</option>
              <option value={UserRole.MANAGER}>Manager</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reparto</label>
            <select value={department} onChange={e => setDepartment(e.target.value as Department)} className="w-full border rounded-lg p-2">
              {Object.values(Department).map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          {role === UserRole.MANAGER && (
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Password Manager</label>
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded-lg p-2" placeholder="Imposta password di accesso" />
             </div>
          )}
          <div className="md:col-span-2">
            <button type="submit" className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 w-full md:w-auto">Crea Utente</button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ruolo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reparto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(u => (
                <tr key={u.id}>
                  <td className="px-6 py-4 whitespace-nowrap flex items-center">
                    <img className="h-8 w-8 rounded-full mr-3" src={u.avatar} alt="" />
                    <span className="font-medium text-gray-900">{u.name}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${u.role === UserRole.MANAGER ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};