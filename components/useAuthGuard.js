'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';

export function useAuthGuard({ forwarderOnly = false, operatorOnly = false } = {}) {
  const { session, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!session) { router.push('/'); return; }
    if (profile) {
      if (forwarderOnly && profile.user_type === 'operator') router.push('/operator');
      if (operatorOnly && profile.user_type !== 'operator') router.push('/search');
    }
  }, [session, profile, loading, forwarderOnly, operatorOnly, router]);

  return { session, profile, loading: loading || !profile };
}