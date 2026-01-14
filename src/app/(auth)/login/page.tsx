'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #123A43 0%, #5D7D87 100%)',
      }}
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-4 pb-6">
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#123A43' }}
            >
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold" style={{ color: '#123A43' }}>
              AI Team Tracker
            </h1>
            <p className="text-sm" style={{ color: '#5D7D87' }}>
              Authorized access only
            </p>
          </div>
        </CardHeader>
        <form onSubmit={handleSignIn}>
          <CardContent className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-md text-sm"
                style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
              >
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                className="h-11"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                className="h-11"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 text-base font-medium"
              style={{ backgroundColor: '#123A43' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </CardContent>
        </form>
        <CardFooter className="flex justify-center pt-2 pb-6">
          <p className="text-xs" style={{ color: '#8795B0' }}>
            Protected by SSO / Azure AD integration
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
