'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Turnstile from 'react-turnstile';
import Login from './login'; 

export default function Home() {
  const [fotolar, setFotolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [oyHakki, setOyHakki] = useState(0);
  const [toplamPuan, setToplamPuan] = useState(0);
  const [oylamaPaneli, setOylamaPaneli] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });
  const [secilenPuan, setSecilenPuan] = useState<number | null>(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // SAYFA AÇILIR AÇILMAZ ÇALIŞACAK
  useEffect(() => {
    kediGetir(); // Hemen kedileri getir
    checkUser(); // Arka planda kullanıcıya bak
  }, []);

  const checkUser = async () => {
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

  const kediGetir = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=10');
      const data = await res.json();
      setFotolar(prev => [...prev, ...data.map((k: any) => ({ id: k.id, foto_url: k.url, liked: false }))]);
    } catch (e) {}
    setLoading(false);
  };

  const oylamaAc = (index: number) => {
    if (!user) { setShowLoginModal(true); return; } // GİRİŞ YOKSA LOGIN AÇ
    setSecilenPuan(null); 
    setOylamaPaneli({ open: true, index });
  };

  // ... (oyVer, paylas vb. fonksiyonlar yukarıdakilerle aynı)

  return (
    <main ref={scrollContainerRef} className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
      
      {/* ÜST BAR (HERKESE AÇIK) */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-xl flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between bg-white/10 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] pointer-events-auto">
            <Link href="/" className="pl-3">
              <h1 className="text-xl font-black text-white italic tracking-tighter">Cici<span className="text-amber-500">Pet</span></h1>
            </Link>
            <button 
              onClick={() => user ? window.location.href='/profil' : setShowLoginModal(true)}
              className="bg-white/5 px-4 py-2 rounded-2xl text-white font-black text-[10px]"
            >
              🏆 {toplamPuan} CP
            </button>
          </div>
        </div>
      </div>

      {/* AKIŞ (HERKES GÖREBİLİR) */}
      {fotolar.map((foto, index) => (
        <section key={foto.id + index} className="h-screen w-full relative flex items-center justify-center snap-start">
          <img src={foto.foto_url} onDoubleClick={() => oylamaAc(index)} className="max-h-[75vh] w-auto max-w-[95%] rounded-[3rem] border-[6px] border-white/5" alt="Pet" />
        </section>
      ))}

      {/* GİRİŞ MODALI */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-zinc-900 p-8 rounded-[3.5rem] relative text-center">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-4 right-6 text-white/50 text-2xl">×</button>
            <Login />
          </div>
        </div>
      )}

      {/* OYLAMA PANELİ (Sadece Girişli) */}
      {oylamaPaneli.open && user && (
         <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-xl">
            {/* ... oylama butonları ... */}
         </div>
      )}
    </main>
  );
}