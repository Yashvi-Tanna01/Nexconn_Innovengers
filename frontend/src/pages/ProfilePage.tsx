import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS, apiRequest, User, logout } from '../config/api';
import { Button } from '../components/common/Button';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    void apiRequest<User>(API_ENDPOINTS.authMe).then((result) => {
      if (result.data) {
        setUser(result.data);
        setName(result.data.full_name);
      } else setMessage(result.error || 'Unable to load your profile.');
    });
  }, []);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await apiRequest<User>(API_ENDPOINTS.profile, {
      method: 'PATCH',
      body: JSON.stringify({ full_name: name }),
    });
    if (result.data) {
      setUser(result.data);
      setMessage('Profile updated.');
    } else setMessage(result.error || 'Unable to update your profile.');
  };
  if (!user) return <div className="p-6 text-sm text-[#737C78]">{message || 'Loading profile…'}</div>;
  const initials = user.full_name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  return (
    <section className="mx-auto w-full max-w-2xl space-y-5 px-2 py-5">
      <header className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#286B56] text-lg font-bold text-white">{initials}</div>
        <div><h1 className="text-xl font-bold">{user.full_name}</h1><p className="text-sm text-[#737C78]">{user.email}</p></div>
      </header>
      <div className="rounded-2xl border border-[#E3E8E4] bg-white p-5">
        <div className="mb-4 flex gap-2 text-xs"><span className="rounded-full bg-[#E1F0E8] px-2 py-1 font-bold uppercase text-[#286B56]">{user.role}</span><span className="rounded-full bg-stone-100 px-2 py-1">{user.is_active ? 'Active' : 'Inactive'}</span></div>
        <form onSubmit={save} className="space-y-4">
          <label className="block text-sm font-semibold">Full name<input className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2 font-normal" value={name} onChange={(event) => setName(event.target.value)} minLength={2} required /></label>
          {message && <div role="status" className="text-sm text-[#286B56]">{message}</div>}
          <Button type="submit">Save profile</Button>
        </form>
        <button className="mt-4 text-sm font-semibold text-red-700" onClick={async () => { await logout(); navigate('/login', { replace: true }); }}>Log out</button>
      </div>
    </section>
  );
};
export default ProfilePage;
