"use client"

export const dynamic = "force-dynamic";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const RedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/admin/dashboard"); // Sem dej URL, na kterou chceš redirectovat
  }, [router]);

  return null; // Nezobrazuje žádný obsah
};

export default RedirectPage;