'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Kesfet() {
  const [petler, setPetler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tumPetleriGetir = async () => {
      // Tüm patileri en yeni yüklenenden başlayarak getir
      const { data } = await supabase
        .from('fotolar')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (data) setPetler(data);
      setLoading(false);
    };
    tumPetleriGetir();
  }, []);

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase italic">Yükleniyor...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans">
      
      {/* Üst Bar */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 mt-4">
        <Link href="/" className="bg-white p-3 rounded-2xl shadow-sm text-xs font-black text-amber-600 uppercase italic border-2 border-white">
          ← Oyla
        </Link>
        <h1 className="text-2xl font-black text-amber-600 uppercase italic tracking-tighter text-center">Tüm Patiler 🐾</h1>
        <Link href="/profil" className="bg-white p-3 rounded-2xl shadow-sm text-xs font-black text-amber-600 uppercase italic border-2 border-white">
          Profil 👤
        </Link>
      </div>

      {/* Grid Galeri */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {petler.map((pet) => (
          <Link href={`/pet/${pet.id}`} key={pet.id} className="group relative aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-lg active:scale-95 transition-all">
            <img src={pet.foto_url} alt={pet.pet_adi} className="w-full h-full object-cover" />
            
            {/* Hover/Alt Bilgi */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
              <div className="text-white font-black text-[10px] uppercase truncate">{pet.pet_adi}</div>
              <div className="text-amber-400 font-black text-xs">{pet.puan} CP</div>
            </div>
          </Link>
        ))}
      </div>

      {petler.length === 0 && (
        <div className="text-center mt-20 text-gray-400 font-bold italic uppercase">Henüz hiç pati yüklenmemiş!</div>
      )}

    </main>
  );
}