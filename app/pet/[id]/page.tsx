'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function PetDetay() {
  const params = useParams();
  const id = params?.id;
  const [pet, setPet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [oyHakki, setOyHakki] = useState(0);

  const enerjiCek = async (userId: string) => {
    const { data: profil } = await supabase.from('profil').select('oy_hakki').eq('id', userId).single();
    if (profil) setOyHakki(profil.oy_hakki);
  };

  useEffect(() => {
    if (!id) return;
    const detayGetir = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await enerjiCek(session.user.id);
      }
      const { data } = await supabase.from('fotolar').select('*').eq('id', id).single();
      if (data) setPet(data);
      setLoading(false);
    };
    detayGetir();
  }, [id]);

  const oyVer = async () => {
    if (!user || !pet || oyHakki <= 0) {
      if (oyHakki <= 0) alert("Enerjin bitti!");
      return;
    }

    const yeniHak = oyHakki - 1;
    setOyHakki(yeniHak);
    const yeniPuan = (pet.puan || 0) + 1;
    setPet({ ...pet, puan: yeniPuan });

    await supabase.from('fotolar').update({ puan: yeniPuan }).eq('id', pet.id);
    const { data: profil } = await supabase.from('profil').select('toplam_puan').eq('id', user.id).single();
    await supabase.from('profil').update({ 
      oy_hakki: yeniHak, 
      toplam_puan: (profil?.toplam_puan || 0) + 1 
    }).eq('id', user.id);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase italic">Yükleniyor...</div>;
  if (!pet) return <div className="text-center p-10 font-black uppercase italic">Pati bulunamadı!</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans">
      <div className="w-full max-w-sm flex justify-between items-center mb-6 mt-4">
        <Link href="/kesfet" className="bg-white p-3 rounded-2xl shadow-sm text-xs font-black text-amber-600 uppercase italic border-2 border-white">← Geri</Link>
        <div className="bg-orange-100 px-4 py-1 rounded-full text-orange-600 font-black text-[10px] uppercase shadow-inner">⚡ Enerji: {oyHakki}</div>
      </div>

      <div className="bg-white p-4 rounded-[3rem] shadow-2xl border-8 border-white w-full max-w-sm overflow-hidden">
        <div className="relative aspect-square rounded-[2.5rem] overflow-hidden mb-6 shadow-inner border-2 border-amber-50">
          <img src={pet.foto_url} alt={pet.pet_adi} className="w-full h-full object-cover" />
        </div>
        <div className="text-center space-y-2 mb-6">
          <h2 className="text-3xl font-black text-gray-800 uppercase italic">{pet.pet_adi}</h2>
          <div className="text-amber-500 font-black text-sm uppercase">{pet.puan || 0} CP</div>
        </div>
        <button 
          onClick={oyVer} 
          disabled={oyHakki <= 0}
          className="w-full py-5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-black text-xl shadow-lg active:scale-95 transition-all uppercase italic disabled:opacity-50"
        >
          {oyHakki > 0 ? "Oy Ver! 🐾" : "Enerji Bitti"}
        </button>
      </div>
    </main>
  );
}