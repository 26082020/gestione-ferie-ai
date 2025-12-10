
import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface LoginProps {
  users: User[];
  onLogin: (user: User) => void;
  externalLogin: (email: string, password: string | undefined, role: string) => Promise<void>;
}

export const Login: React.FC<LoginProps> = ({ users, onLogin, externalLogin }) => {
  const [role, setRole] = useState<UserRole>(UserRole.EMPLOYEE);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Use the API login instead of local filtering
      await externalLogin(email, role === UserRole.MANAGER ? password : undefined, role);
    } catch (err: any) {
      setError(err.message || "Errore durante il login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl">
            ✈️
          </div>
          <h1 className="text-2xl font-bold text-gray-800">FerieManager</h1>
          <p className="text-gray-500">Accedi al portale ferie</p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
          <button
            onClick={() => { setRole(UserRole.EMPLOYEE); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              role === UserRole.EMPLOYEE ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Dipendente
          </button>
          <button
            onClick={() => { setRole(UserRole.MANAGER); setError(''); }}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition ${
              role === UserRole.MANAGER ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Manager
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Aziendale</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="nome@azienda.it"
            />
          </div>

          {role === UserRole.MANAGER && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-gray-300 border p-2.5 focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="••••••••"
              />
            </div>
          )}

          {error && (
            <div className="text-red-500 text-sm bg-red-50 p-2 rounded flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex justify-center items-center"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              `Accedi come ${role}`
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Demo: mario@azienda.it (admin) / luca@azienda.it (user)
        </div>
      </div>
    </div>
  );
};
