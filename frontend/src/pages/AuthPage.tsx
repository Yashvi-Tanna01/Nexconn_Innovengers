import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { AntahLogo } from '../components/brand/AntahLogo';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { login, register } from '../config/api';

export const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    if (mode === 'register') {
      const registration = await register(email, fullName, password);
      if (!registration.data) {
        setError(registration.error || 'Unable to create the account.');
        setIsSubmitting(false);
        return;
      }
    }

    const result = await login(email, password);
    setIsSubmitting(false);
    if (!result.data) {
      setError(result.error || 'Unable to sign in.');
      return;
    }
    const requestedPath = typeof location.state?.from === 'string' ? location.state.from : '/dashboard';
    navigate(requestedPath, { replace: true });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <Card variant="panel" className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <AntahLogo size="md" />
          <div>
            <CardTitle>{mode === 'login' ? 'Sign in to ANTAH' : 'Create your resident account'}</CardTitle>
            <CardDescription>
              {mode === 'login'
                ? 'Access reports, signals, and authorized coordination updates.'
                : 'Submit observations and follow verified community incidents.'}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            {mode === 'register' && (
              <Input
                label="Full name"
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                required
                minLength={2}
              />
            )}
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
            />
            {error && (
              <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                {error}
              </div>
            )}
            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Connecting…' : mode === 'login' ? 'Sign in' : 'Create account'}
              <ArrowRight size={15} />
            </Button>
          </form>
          <div className="mt-5 flex items-center gap-2 text-[11px] text-antah-slate">
            <ShieldCheck size={14} className="text-antah-teal" />
            Credentials are handled by the ANTAH backend and never exposed to external services.
          </div>
          <button
            type="button"
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError(null);
            }}
            className="mt-5 text-xs font-semibold text-antah-teal hover:underline"
          >
            {mode === 'login' ? 'Need an account? Register' : 'Already registered? Sign in'}
          </button>
          <Link to="/home" className="mt-3 block text-xs text-antah-slate hover:underline">
            Continue browsing public information
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
