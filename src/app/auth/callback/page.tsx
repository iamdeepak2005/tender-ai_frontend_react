'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { handleAuthCallback } from '@/lib/auth';
import { useToast } from '@/contexts/ToastContext';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (!code) {
      addToast('Invalid authentication attempt', 'error');
      router.push('/login');
      return;
    }

    const authenticate = async () => {
      try {
        const user = await handleAuthCallback();
        if (user) {
          addToast(`Welcome, ${user.full_name || user.email}!`, 'success');
          router.push('/dashboard');
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Authentication error:', error);
        addToast('Failed to authenticate. Please try again.', 'error');
        router.push('/login');
      }
    };

    authenticate();
  }, [searchParams, router, addToast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-800">Completing authentication...</h2>
        <p className="text-gray-600 mt-2">Please wait while we log you in.</p>
      </div>
    </div>
  );
}
