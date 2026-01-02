'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Profil() {
  const [user, setUser] = useState<any>(null);
  const [petler, setPetler] = useState<any[]>([]);
  const [toplamPuan, setToplamPuan] = useState(0);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const getData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/');
        return;
      }
      setUser(session.user);

      // 1. Profil puanını getir
      const { data: profilData } = await supabase.from('profil').select('toplam_puan').eq('id', session.user.id).single();
      if (profilData) setToplamPuan(profilData.toplam_puan);

      // 2. Kullanıcının petlerini getir
      const { data: petData } = await supabase
        .from('fotolar')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
      
      if (petData) setPetler(petData);
      setLoading(false);
    };
    getData();
  }, []);

  const petSil = async (id: string) => {
    if (confirm("Pati dostunu yarışmadan çekmek istediğine emin misin?")) {
      const { error } = await supabase.from('fotolar').delete().eq('id', id);
      if (!error) {
        setPetler(petler.filter(p => p.id !== id));
        alert("Pati silindi.");
      }
    }
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase">Yükleniyor...</div>;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans pb-10">
      
      {/* Üst Kısım: Kullanıcı Özeti */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl text-center border-8 border-white w-full max-w-sm mb-6 mt-4">
        <Link href="/" className="text-xs font-bold text-amber-500 uppercase mb-4 block underline text-left">← Yarışmaya Dön</Link>
        <img src={user?.user_metadata?.avatar_url} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-amber-100" />
        <h1 className="text-xl font-black text-gray-800 uppercase">{user?.user_metadata?.full_name}</h1>
        <div className="mt-4 bg-amber-500 text-white py-2 px-4 rounded-2xl inline-block font-black shadow-lg">
          TOPLAM: {toplamPuan} CP
        </div>
      </div>

      {/* Petlerim Listesi */}
      <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-xl border-4 border-white">
        <h2 className="text-xl font-black text-amber-600 uppercase italic mb-6">🐾 Patilerim</h2>
        
        {petler.length > 0 ? (
          <div className="space-y-6">
            {petler.map((pet) => (
              <div key={pet.id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex gap-4 items-center">
                  <img src={pet.foto_url} className="w-16 h-16 rounded-2xl object-cover shadow-md" />
                  <div className="flex-1">
                    <div className="font-black text-gray-700 uppercase text-sm">{pet.pet_adi}</div>
                    <div className="text-xs text-gray-400 font-bold uppercase italic">
                      {new Date(pet.created_at).toLocaleDateString('tr-TR')} tarihinde katıldı
                    </div>
                    <div className="text-orange-500 font-black text-lg">{pet.puan} CP</div>
                  </div>
                  <button onClick={() => petSil(pet.id)} className="bg-red-50 text-red-500 p-2 rounded-xl hover:bg-red-100 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-400 font-bold italic mb-4 text-sm">Henüz bir patin yok!</p>
            <Link href="/" className="bg-amber-100 text-amber-600 px-4 py-2 rounded-xl font-black text-xs uppercase">Hemen Yükle</Link>
          </div>
        )}
      </div>

    </main>
  );
}