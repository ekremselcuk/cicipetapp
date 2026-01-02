'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PetDetay() {
  const params = useParams();
  const id = params?.id; // URL'den ID'yi al
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const detayGetir = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user);

      const { data, error } = await supabase.from('fotolar').select('*').eq('id', id).single();
      if (data) setPet(data);
      if (error) console.error("Hata:", error.message);
      setLoading(false);
    };
    detayGetir();
  }, [id]);

  const oyVer = async () => {
    if (!user || !pet) return;
    const yeniPuan = (pet.puan || 0) + 1;
    setPet({ ...pet, puan: yeniPuan });

    await supabase.from('fotolar').update({ puan: yeniPuan }).eq('id', pet.id);
    const { data: profil } = await supabase.from('profil').select('toplam_puan').eq('id', user.id).single();
    await supabase.from('profil').upsert({ id: user.id, toplam_puan: (profil?.toplam_puan || 0) + 1 });
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase italic">Yükleniyor...</div>;
  if (!pet) return <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-amber-50 font-black text-amber-600 uppercase italic p-10 text-center">Pati bulunamadı! <Link href="/kesfet" className="text-sm bg-white px-6 py-2 rounded-xl shadow-sm underline">Geri Dön</Link></div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans">
      <div className="w-full max-w-sm flex justify-between items-center mb-6 mt-4">
        <Link href="/kesfet" className="bg-white p-3 rounded-2xl shadow-sm text-xs font-black text-amber-600 uppercase italic border-2 border-white">← Keşfet</Link>
        <h1 className="text-xl font-black text-amber-600 uppercase italic tracking-tighter">Pati Detayı</h1>
        <div className="w-10"></div>
      </div>

      <div className="bg-white p-4 rounded-[3rem] shadow-2xl border-8 border-white w-full max-w-sm overflow-hidden">
        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-6 shadow-inner border-2 border-amber-50">
          <img src={pet.foto_url} alt={pet.pet_adi} className="w-full h-full object-cover" />
        </div>
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-black text-gray-800 uppercase italic tracking-tight">{pet.pet_adi}</h2>
          <div className="inline-block bg-amber-100 px-4 py-1 rounded-full text-amber-600 font-black text-sm uppercase">{pet.puan || 0} CP</div>
        </div>
        <button onClick={oyVer} className="w-full py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xl shadow-lg active:scale-95 transition-all uppercase italic">Bu Patiye Oy Ver! 🐾</button>
      </div>
    </main>
  );
}