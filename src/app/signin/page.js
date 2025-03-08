'use client';
import { Suspense } from 'react';
import Signin from '@/app/components/Signin';

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signin />
    </Suspense>
  );
}
