'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Login from './login';

export default function Home() {
  const [fotolar, setFotolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [oyHakki, setOyHakki] = useState(0);
  const [toplamPuan, setToplamPuan] = useState(0);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profil').select('oy_hakki, toplam_puan').eq('id', session.user.id).single();
        if (data) {
          setOyHakki(data.oy_hakki || 0);
          setToplamPuan(data.toplam_puan || 0);
        }
        kediGetir();
      }
    };
    checkUser();
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

    await supabase.from('profil').update({ oy_hakki: yeniHak, toplam_puan: yeniPuan }).eq('id', user.id);
  };

  const cikisYap = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!user) return <main className="h-screen flex items-center justify-center bg-black"><Login /></main>;

  return (
    <main className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide select-none">
      
      {/* ÜST BAR (Şeffaf & Tasarıma Uyumlu) */}
      <div className="fixed top-0 left-0 w-full z-50 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">CiciPet</h1>
          <div className="flex gap-3 mt-1 font-bold text-[10px] text-amber-400 uppercase italic">
            <span>⚡ {oyHakki} Enerji</span>
            <span>🏆 {toplamPuan} CP</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/profil" className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase italic hover:bg-white/20 transition-all">Profil 👤</Link>
          <button onClick={cikisYap} className="bg-red-500/20 backdrop-blur-xl border border-red-500/30 text-red-500 px-5 py-2 rounded-full text-[10px] font-black uppercase italic">Çıkış</button>
        </div>
      </div>

      {/* SONSUZ AKIŞ */}
      {fotolar.map((foto, index) => (
        <section 
          key={foto.id + index} 
          ref={fotolar.length === index + 1 ? sonElemanRef : null}
          className="h-screen w-full relative flex items-center justify-center snap-start bg-zinc-900"
        >
          {/* Arkaplan Blur */}
          <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20" alt="" />
          
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img 
              src={foto.foto_url} 
              onDoubleClick={() => begeniAt(index)}
              className="max-h-[80vh] w-auto max-w-[95%] rounded-[3rem] shadow-2xl border-[6px] border-white/5 object-contain"
              alt="Pet"
            />

            {/* OY VER BUTONU (Yeni İşlevsel Tasarım) */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center">
              <button 
                onClick={() => begeniAt(index)}
                className={`group flex flex-col items-center gap-2 p-2 rounded-full transition-all active:scale-90`}
              >
                <div className={`p-5 rounded-full shadow-2xl transition-all duration-300 ${foto.liked ? 'bg-red-600 scale-110' : 'bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill={foto.liked ? "white" : "none"} viewBox="0 0 24 24" strokeWidth={2.5} stroke={foto.liked ? "white" : "white"} className="w-8 h-8">
                    <path d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <span className={`text-[10px] font-black uppercase italic tracking-widest drop-shadow-md ${foto.liked ? 'text-red-500' : 'text-white'}`}>
                  {foto.liked ? 'Oylandı' : 'Oy Ver'}
                </span>
              </button>
            </div>
          </div>
        </section>
      ))}

      {loading && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50">
          <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}
    </main>
  );
}