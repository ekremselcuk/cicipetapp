'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Kesfet() {
  const [petler, setPetler] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [oyHakki, setOyHakki] = useState(0);
  const [oyVeriyor, setOyVeriyor] = useState(false); // Hız sınırı için kilit

  const enerjiCek = async (userId: string) => {
    const { data: profil } = await supabase.from('profil').select('oy_hakki').eq('id', userId).maybeSingle();
    if (profil) setOyHakki(profil.oy_hakki ?? 0);
  };

  useEffect(() => {
    const dataGetir = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await enerjiCek(session.user.id);
      }
      const { data } = await supabase.from('fotolar').select('*').order('puan', { ascending: false });
      if (data) setPetler(data);
      setLoading(false);
    };
    dataGetir();

    const handleFocus = () => {
      if (user?.id) enerjiCek(user.id);
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user?.id]);

  const hızlıOyVer = async (e: React.MouseEvent, petId: string, mevcutPuan: number) => {
    e.preventDefault();
    
    // Güvenlik Kontrolleri: Kullanıcı yoksa, enerji yoksa veya işlem devam ediyorsa durdur.
    if (!user || oyHakki <= 0 || oyVeriyor) return;

    setOyVeriyor(true); // Kilidi tak

    const yeniHak = oyHakki - 1;
    const yeniPetPuani = mevcutPuan + 1;

    // 1. Arayüzü anlık güncelle (Hız hissi)
    setOyHakki(yeniHak);
    setPetler(prev => prev.map(p => p.id === petId ? { ...p, puan: yeniPetPuani } : p));

    try {
      // 2. DB'yi güncelle
      await supabase.from('fotolar').update({ puan: yeniPetPuani }).eq('id', petId);
      
      const { data: profil } = await supabase.from('profil').select('toplam_puan').eq('id', user.id).single();
      await supabase.from('profil').update({ 
        oy_hakki: yeniHak, 
        toplam_puan: (profil?.toplam_puan || 0) + 1 
      }).eq('id', user.id);
    } catch (error) {
      console.error("Oylama hatası:", error);
    } finally {
      // 3. Soğuma Süresi: 500ms sonra kilidi aç (Botların seri tıklamasını engeller)
      setTimeout(() => {
        setOyVeriyor(false);
      }, 500);
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase italic">Yükleniyor...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans pb-20">
      
      <div className="w-full max-w-md flex justify-between items-center mb-6 mt-4 px-2">
        <Link href="/" className="bg-white px-4 py-2 rounded-2xl shadow-md text-[10px] font-black text-amber-600 uppercase italic border-2 border-white active:scale-90 transition-all">
          ← Ana Sayfa
        </Link>
        <div className="flex flex-col items-end">
          <h1 className="text-xl font-black text-amber-600 uppercase italic tracking-tighter">Keşfet 🌍</h1>
          <div className="bg-white px-3 py-1 rounded-full shadow-sm border-2 border-orange-100">
            <span className="text-[10px] font-black text-orange-500 uppercase italic">⚡ Enerji: {oyHakki}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {petler.map((pet) => (
          <div key={pet.id} className="relative group">
            <Link href={`/pet/${pet.id}`} className="block aspect-square rounded-[2rem] overflow-hidden border-4 border-white shadow-lg active:scale-95 transition-all bg-white relative">
              <img src={pet.foto_url} alt={pet.pet_adi} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 pt-6">
                <div className="text-white font-black text-[10px] uppercase truncate">{pet.pet_adi}</div>
                <div className="text-amber-400 font-black text-xs">{pet.puan || 0} CP</div>
              </div>
            </Link>

            <button 
              onClick={(e) => hızlıOyVer(e, pet.id, pet.puan || 0)}
              disabled={oyHakki <= 0 || oyVeriyor}
              className={`absolute -top-2 -right-2 w-10 h-10 rounded-full shadow-xl flex items-center justify-center text-lg transition-all border-4 border-white z-10 
                ${oyHakki > 0 && !oyVeriyor
                  ? 'bg-gradient-to-br from-red-400 to-pink-500 hover:scale-110 active:scale-75' 
                  : 'bg-gray-300 grayscale cursor-not-allowed opacity-50'}`}
            >
              {oyVeriyor ? '⏳' : '❤️'}
            </button>
          </div>
        ))}
      </div>

      {oyHakki === 0 && (
        <div className="mt-8 bg-white/50 p-4 rounded-2xl border-2 border-dashed border-orange-200 text-center">
          <p className="text-xs font-bold text-orange-600 uppercase italic">Enerjin bitti! Ana sayfadan 📺 izle.</p>
        </div>
      )}
    </main>
  );
}