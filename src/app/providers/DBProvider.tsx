// app/providers/DBProvider.tsx
'use client';
import { useEffect, useState } from 'react';
import { initDB } from '@/lib/db';

export default function DBProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    initDB().then(() => setReady(true));
  }, []);

  if (!ready) return <div style={{ padding: 20 }}>Загрузка базы данных...</div>;
  return <>{children}</>;
}