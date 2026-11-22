import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_ENDPOINTS, apiRequest, User as AuthUser, logout } from '../config/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import {
  User,
  Mail,
  ShieldCheck,
  MapPin,
  Bell,
  Radio,
  LogOut,
  CheckCircle2,
  Sparkles,
  Sliders,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [name, setName] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [telemetrySyncEnabled, setTelemetrySyncEnabled] = useState(true);

  useEffect(() => {
    void apiRequest<AuthUser>(API_ENDPOINTS.authMe).then((result) => {
      if (result.data) {
        setUser(result.data);
        setName(result.data.full_name);
      } else {
        setMessage(result.error || 'Unable to load profile telemetry.');
      }
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSaving(true);
    setMessage(null);
    const result = await apiRequest<AuthUser>(API_ENDPOINTS.profile, {
      method: 'PATCH',
      body: JSON.stringify({ full_name: name }),
    });
    if (result.data) {
      setUser(result.data);
      setMessage('Profile settings saved successfully.');
    } else {
      setMessage(result.error || 'Unable to update profile.');
    }
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  if (!user) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center p-6 text-sm text-[#737C78]">
        {message || 'Loading profile telemetrics…'}
      </div>
    );
  }

  const initials = user.full_name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-6 pt-2 pb-32 sm:pb-40 space-y-5 select-none box-border">
      {/* 1. Header with Brand Identity & Breadcrumb */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E3E8E4]">
        <div>
          <h1 className="text-xl font-bold text-[#202827] font-sans tracking-tight">
            Account & Preferences
          </h1>
          <p className="text-[11px] text-[#737C78]">
            Operator Profile • ANTAH Civic Intelligence Network
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E1F0E8] border border-[#286B56]/20 text-[10px] font-mono text-[#286B56] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-[#286B56] animate-pulse" />
          <span>ACTIVE SESSION</span>
        </div>
      </div>

      {/* 2. User Info Hero Card */}
      <Card variant="panel" className="p-5 sm:p-6 bg-white/90 backdrop-blur-md border-[#E3E8E4] shadow-soft-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#164E3D] via-[#286B56] to-[#E7A65B] flex items-center justify-center text-white text-xl font-black shadow-md shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-[#202827] truncate font-sans">
                {user.full_name}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-[#737C78] mt-0.5 truncate font-mono">
                <Mail size={13} className="text-[#286B56]" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-[#E1F0E8] text-[#164E3D] text-[10px] font-mono font-bold uppercase tracking-wider border border-[#286B56]/15">
                  ROLE: {user.role}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-[#475569] text-[10px] font-mono font-semibold uppercase">
                  {user.is_active ? 'Status: Active' : 'Status: Suspended'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* 3. Territorial Assignment Telemetry Card */}
      <Card variant="default" className="p-4 sm:p-5 bg-white border-[#E3E8E4] space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#737C78] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin size={14} className="text-[#286B56]" />
            <span>TERRITORIAL SECTOR ASSIGNMENT</span>
          </span>
          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
            GRID ACTIVE
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          <div className="p-3 rounded-xl bg-[#F5F6F4] border border-[#E3E8E4]">
            <span className="text-[10px] font-mono uppercase text-[#737C78] block">Jurisdiction</span>
            <span className="text-sm font-bold text-[#202827] block mt-0.5">Bangalore East</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F5F6F4] border border-[#E3E8E4]">
            <span className="text-[10px] font-mono uppercase text-[#737C78] block">Node Sector</span>
            <span className="text-sm font-bold text-[#202827] block mt-0.5">Sector 3 Quad</span>
          </div>
          <div className="p-3 rounded-xl bg-[#F5F6F4] border border-[#E3E8E4] col-span-2 sm:col-span-1">
            <span className="text-[10px] font-mono uppercase text-[#737C78] block">Mesh Authority</span>
            <span className="text-sm font-bold text-[#286B56] block mt-0.5">Verified Reporter</span>
          </div>
        </div>
      </Card>

      {/* 4. Edit Personal Profile Form */}
      <Card variant="default" className="p-4 sm:p-5 bg-white border-[#E3E8E4]">
        <CardHeader className="px-0 pt-0 pb-3">
          <CardTitle className="text-sm sm:text-base text-[#202827] flex items-center gap-2">
            <User size={16} className="text-[#286B56]" />
            <span>Personal Information</span>
          </CardTitle>
          <CardDescription className="text-xs text-[#737C78]">
            Update your public operator identity displayed on reports and coordination desks.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your official name"
            required
            minLength={2}
          />
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-antah-navy tracking-wide uppercase">
              Registered Email (Immutable)
            </label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full bg-[#F5F6F4] text-slate-500 text-xs rounded-xl border border-slate-200 px-3 py-2.5 cursor-not-allowed font-mono"
            />
          </div>

          {message && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                message.includes('success')
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              <CheckCircle2 size={14} className="shrink-0" />
              <span>{message}</span>
            </motion.div>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              disabled={isSaving || !name.trim()}
              className="font-bold shadow-soft-xs"
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* 5. Toggles & Telemetry Preferences */}
      <Card variant="default" className="p-4 sm:p-5 bg-white border-[#E3E8E4] space-y-4">
        <CardHeader className="px-0 pt-0 pb-1">
          <CardTitle className="text-sm sm:text-base text-[#202827] flex items-center gap-2">
            <Sliders size={16} className="text-[#286B56]" />
            <span>Platform Toggles & Preferences</span>
          </CardTitle>
          <CardDescription className="text-xs text-[#737C78]">
            Configure your client notifications and spatial data telemetry behavior.
          </CardDescription>
        </CardHeader>

        <div className="divide-y divide-slate-100 space-y-1">
          {/* Toggle 1: Push Notifications */}
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#202827] flex items-center gap-1.5">
                <Bell size={13} className="text-[#286B56]" />
                <span>Incident Notification Pings</span>
              </span>
              <p className="text-[11px] text-[#737C78]">
                Receive instant alerts for new spatial clusters identified in your sector.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-11 h-6 rounded-full p-1 transition-colors relative duration-200 focus:outline-none ${
                notificationsEnabled ? 'bg-[#164E3D]' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                  notificationsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Toggle 2: Mesh Sync */}
          <div className="flex items-center justify-between py-3">
            <div className="space-y-0.5">
              <span className="text-xs font-semibold text-[#202827] flex items-center gap-1.5">
                <Radio size={13} className="text-[#286B56]" />
                <span>Live Territorial Mesh Synchronization</span>
              </span>
              <p className="text-[11px] text-[#737C78]">
                Keep real-time WebSocket signals synced with the municipal digital twin.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setTelemetrySyncEnabled(!telemetrySyncEnabled)}
              className={`w-11 h-6 rounded-full p-1 transition-colors relative duration-200 focus:outline-none ${
                telemetrySyncEnabled ? 'bg-[#164E3D]' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform duration-200 shadow-xs ${
                  telemetrySyncEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </Card>

      {/* 6. Session Termination / Logout Action */}
      <div className="p-4 rounded-2xl bg-red-50/60 border border-red-200/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-red-900 block font-sans">
            Terminate Active Session
          </span>
          <p className="text-[11px] text-red-700">
            Sign out of your account on this device. You will need your credentials to reconnect.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:scale-95 transition-all shadow-xs shrink-0"
        >
          <LogOut size={13} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
