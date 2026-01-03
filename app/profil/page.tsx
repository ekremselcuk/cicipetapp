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
  }, [router]);

  const petSil = async (id: string) => {
    if (confirm("Pati dostunu yarışmadan çekmek istediğine emin misin?")) {
      const { error } = await supabase.from('fotolar').delete().eq('id', id);
      if (!error) {
        setPetler(petler.filter(p => p.id !== id));
      }
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black font-black text-amber-500 uppercase italic animate-pulse">
      Yükleniyor...
    </div>
  );

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-black font-sans pb-10 text-white">
      
      {/* ÜST BAR / GERİ DÖN */}
      <div className="w-full max-w-md flex justify-start mb-6 mt-4">
        <Link href="/" className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black text-amber-500 uppercase italic active:scale-95 transition-all">
          ← Yarışmaya Dön
        </Link>
      </div>

      {/* KULLANICI KARTI */}
      <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[3rem] border border-white/10 w-full max-w-md text-center shadow-2xl mb-8">
        <div className="relative inline-block">
          <img 
            src={user?.user_metadata?.avatar_url} 
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.2)]" 
            alt="Avatar"
          />
          <div className="absolute -bottom-1 -right-1 bg-amber-500 text-[10px] p-1.5 rounded-full">🐾</div>
        </div>
        
        <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
          {user?.user_metadata?.full_name}
        </h1>
        
        <div className="mt-6 bg-amber-500 text-black py-3 px-8 rounded-2xl inline-block font-black italic shadow-[0_10px_20px_rgba(245,158,11,0.3)] uppercase text-sm">
          🏆 {toplamPuan} CP
        </div>
      </div>

      {/* PETLERİM LİSTESİ */}
      <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl rounded-[3rem] p-8 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-black text-amber-500 uppercase italic tracking-tighter">Patilerim</h2>
          <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{petler.length} ADET</span>
        </div>
        
        {petler.length > 0 ? (
          <div className="space-y-8">
            {petler.map((pet) => (
              <div key={pet.id} className="group relative">
                <div className="flex gap-5 items-center">
                  <div className="relative">
                    <img 
                      src={pet.foto_url} 
                      className="w-20 h-20 rounded-[1.5rem] object-cover border-2 border-white/5 group-hover:border-amber-500/50 transition-all duration-500" 
                      alt="Pet"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-black text-white uppercase text-sm italic tracking-tight">{pet.pet_adi}</div>
                    <div className="text-[9px] text-white/40 font-bold uppercase italic mt-1">
                      {new Date(pet.created_at).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="text-amber-500 font-black text-xl mt-1 italic tracking-tighter">{pet.puan} CP</div>
                  </div>

                  <button 
                    onClick={() => petSil(pet.id)} 
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 p-3 rounded-2xl transition-all active:scale-90 border border-red-500/10"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                    </svg>
                  </button>
                </div>
                <div className="h-px bg-white/5 w-full mt-8 last:hidden"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/20 font-bold italic mb-6 text-sm uppercase">Henüz bir patin yarışmıyor!</p>
            <Link href="/" className="bg-white/5 border border-white/10 text-amber-500 px-6 py-3 rounded-2xl font-black text-[10px] uppercase italic hover:bg-white/10 transition-all">
              Hemen Yarışmaya Katıl
            </Link>
          </div>
        )}
      </div>

    </main>
  );
}