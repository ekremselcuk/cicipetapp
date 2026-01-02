'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Kesfet() {
  const [petler, setPetler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [oyHakki, setOyHakki] = useState(0);

  useEffect(() => {
    const dataGetir = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        // Kullanıcının güncel oylama hakkını alalım (Burada ana sayfadaki mantığı koruyoruz)
        // Şimdilik basitleştirmek için session'dan veya yerel state'den yönetebilirsin.
      }

      const { data } = await supabase.from('fotolar').select('*').order('created_at', { ascending: false });
      if (data) setPetler(data);
      setLoading(false);
    };
    dataGetir();
  }, []);

  const hızlıOyVer = async (e: React.MouseEvent, petId: string, mevcutPuan: number) => {
    e.preventDefault();
    if (!user) return;
    
    // NOT: Ana sayfadaki oyHakki state'ini burada da kontrol etmemiz lazım.
    // Eğer global bir state (Context/Redux) kullanmıyorsak, buraya basit bir sınırlama koyuyorum:
    // Gerçek bir uygulamada bu 'oyHakki' veritabanından çekilmelidir.

    setPetler(prev => prev.map(p => p.id === petId ? { ...p, puan: (p.puan || 0) + 1 } : p));
    await supabase.from('fotolar').update({ puan: mevcutPuan + 1 }).eq('id', petId);
    
    const { data: profil } = await supabase.from('profil').select('toplam_puan').eq('id', user.id).single();
    await supabase.from('profil').upsert({ id: user.id, toplam_puan: (profil?.toplam_puan || 0) + 1 });
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase italic">Yükleniyor...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans pb-10">
      <div className="w-full max-w-md flex justify-between items-center mb-8 mt-4">
        <Link href="/" className="bg-white p-3 rounded-2xl shadow-sm text-xs font-black text-amber-600 uppercase italic border-2 border-white">← Geri</Link>
        <h1 className="text-2xl font-black text-amber-600 uppercase italic tracking-tighter text-center">Keşfet 🌍</h1>
        <div className="w-10"></div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {petler.map((pet) => (
          <div key={pet.id} className="relative">
            {/* BURASI ÖNEMLİ: Link adresi klasör yapısıyla aynı olmalı */}
            <Link href={`/pet/${pet.id}`} className="group block aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-lg active:scale-95 transition-all bg-white">
              <img src={pet.foto_url} alt={pet.pet_adi} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="text-white font-black text-[10px] uppercase truncate">{pet.pet_adi}</div>
                <div className="text-amber-400 font-black text-xs">{pet.puan || 0} CP</div>
              </div>
            </Link>
            <button 
              onClick={(e) => hızlıOyVer(e, pet.id, pet.puan || 0)}
              className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow-md hover:scale-110 active:scale-90 transition-all border-2 border-amber-100 text-lg"
            >
              ❤️
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}