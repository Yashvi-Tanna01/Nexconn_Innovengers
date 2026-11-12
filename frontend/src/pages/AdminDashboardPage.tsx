import React, { useEffect, useState } from 'react';
import { API_ENDPOINTS, apiRequest, User } from '../config/api';

export const AdminDashboardPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiRequest<User[]>('/admin/users').then((result) => {
      if (result.data) setUsers(result.data);
      else setError(result.error || 'Unable to load users.');
    });
  }, []);

  const count = (role: string) => users.filter((user) => user.role === role).length;
  return (
    <section className="w-full space-y-5 px-2 py-4">
      <header>
        <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#286B56]">Administrator workspace</p>
        <h1 className="mt-1 text-2xl font-bold text-[#202827]">Platform overview</h1>
        <p className="mt-1 text-sm text-[#737C78]">Manage accounts, roles, and operational access.</p>
      </header>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div>}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ['Users', users.length],
          ['Residents', count('reporter')],
          ['Coordinators', count('coordinator')],
          ['Responders', count('responder')],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-[#E3E8E4] bg-white p-4">
            <div className="text-2xl font-bold text-[#17533E]">{value}</div>
            <div className="mt-1 text-[11px] text-[#737C78]">{label}</div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl border border-[#E3E8E4] bg-white">
        <div className="border-b border-[#E3E8E4] px-4 py-3 text-sm font-bold">User management</div>
        <div className="divide-y divide-[#E3E8E4]">
          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <div><div className="font-semibold">{user.full_name}</div><div className="text-xs text-[#737C78]">{user.email}</div></div>
              <span className="rounded-full bg-[#E1F0E8] px-2 py-1 text-[10px] font-bold uppercase text-[#286B56]">{user.role}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AdminDashboardPage;
