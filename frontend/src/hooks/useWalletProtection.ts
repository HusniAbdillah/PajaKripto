import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';

export function useWalletProtection() {
  const { isConnected, isConnecting } = useAccount();
  const router = useRouter();

  return {
    isConnected,
    isConnecting,
    redirectToDashboard: () => router.push('/dashboard'),
    redirectToHome: () => router.replace('/'),
  };
}

export function useProtectedRoute() {
  const { isConnected, isConnecting, redirectToHome } = useWalletProtection();
  
  useEffect(() => {
    // Wait for connection check to complete
    if (!isConnecting && !isConnected) {
      redirectToHome();
    }
  }, [isConnected, isConnecting, redirectToHome]);

  return { isConnected, isConnecting };
}

export function useAutoRedirect() {
  const { isConnected, isConnecting, redirectToDashboard } = useWalletProtection();
  
  useEffect(() => {
    // Auto redirect to dashboard if already connected
    if (!isConnecting && isConnected) {
      redirectToDashboard();
    }
  }, [isConnected, isConnecting, redirectToDashboard]);

  return { isConnected, isConnecting };
}