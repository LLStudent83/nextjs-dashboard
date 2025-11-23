'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Status = 'success' | 'error' | undefined;

export function useSuccessNavigation(status: Status, redirectPath: string) {
  const router = useRouter();

  useEffect(() => {
    if (status === 'success') {
      const timer = setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, router, redirectPath]);
}
