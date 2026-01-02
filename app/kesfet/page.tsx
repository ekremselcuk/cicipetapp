'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Kesfet() {
  const [fotolar, setFotolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [oyHakki, setOyHakki] = useState(0);
  const [toplamPuan, setToplamPuan] = useState(0);
  const [user, setUser] = useState<any>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const baslat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profil').select('oy_hakki, toplam_puan').eq('id', session.user.id).single();
        if (data) {
          setOyHakki(data.oy_hakki || 0);
          setToplamPuan(data.toplam_puan || 0);
        }
      }
    };
    baslat();
    kediGetir();
  }, []);

  const kediGetir = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=10');
      const data = await res.json();
      const yeniKediler = data.map((kedi: any) => ({
        id: kedi.id,
        foto_url: kedi.url,
        liked: false
      }));
      setFotolar(prev => [...prev, ...yeniKediler]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const sonElemanRef = useCallback((node: any) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) kediGetir();
    });
    if (node) observer.current.observe(node);
  }, [loading]);

  const begeniAt = async (index: number) => {
    const foto = fotolar[index];
    if (oyHakki <= 0 || foto.liked || !user) return;

    const yeniHak = oyHakki - 1;
    const yeniPuan = toplamPuan + 1;
    setOyHakki(yeniHak);
    setToplamPuan(yeniPuan);
    setFotolar(prev => {
      const kopya = [...prev];
      kopya[index].liked = true;
      return kopya;
    });

    await supabase.from('profil').update({ 
      oy_hakki: yeniHak, 
      toplam_puan: yeniPuan 
    }).eq('id', user.id);
  };

  return (
    <main className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      {/* Üst Sabit Bar */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center p-4 bg-gradient-to-b from-black/60 to-transparent">
        <div className="text-white">
          <h1 className="text-xl font-black italic uppercase tracking-tighter">Keşfet</h1>
          <div className="flex gap-3 text-[10px] font-bold text-amber-400 uppercase italic">
            <span>⚡ {oyHakki}</span>
            <span>🏆 {toplamPuan}</span>
          </div>
        </div>
        <Link href="/" className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-full text-xs font-black uppercase italic border border-white/30">Geri</Link>
      </div>

      {/* Sonsuz Akış */}
      {fotolar.map((foto, index) => (
        <section 
          key={foto.id + index} 
          ref={fotolar.length === index + 1 ? sonElemanRef : null}
          className="h-screen w-full relative flex items-center justify-center snap-start bg-zinc-900"
        >
          {/* Arkaplan Bulanık Resim (Görsellik için) */}
          <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-2xl opacity-30" />
          
          {/* Ana Kedi Resmi */}
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img 
              src={foto.foto_url} 
              className="max-h-[85vh] w-auto max-w-full rounded-[3rem] shadow-2xl border-4 border-white/10 object-contain"
              onDoubleClick={() => begeniAt(index)}
            />

            {/* Sağ Taraftaki İşlem Butonu */}
            <div className="absolute right-6 bottom-32 flex flex-col items-center gap-6">
              <button 
                onClick={() => begeniAt(index)}
                className={`p-5 rounded-full shadow-2xl transition-all active:scale-90 ${foto.liked ? 'bg-red-500 scale-110' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}
              >
                <span className={`text-3xl ${foto.liked ? 'animate-ping absolute opacity-75' : ''}`}>❤️</span>
                <span className="text-3xl relative z-10">❤️</span>
              </button>
              <span className="text-white text-[10px] font-black uppercase italic tracking-widest drop-shadow-md">
                {foto.liked ? 'Oylandı' : 'Oy Ver'}
              </span>
            </div>
          </div>
        </section>
      ))}

      {loading && (
        <div className="h-screen w-full flex items-center justify-center bg-black">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </main>
  );
}