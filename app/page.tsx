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
  const [reklamModu, setReklamModu] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [reklamIzleniyor, setReklamIzleniyor] = useState(false);
  
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
        kediGetir();
      }
    };
    checkUser();
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data } = await supabase.from('profil').select('oy_hakki, toplam_puan').eq('id', userId).single();
    if (data) {
      setOyHakki(data.oy_hakki || 0);
      setToplamPuan(data.toplam_puan || 0);
    }
  };

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
    if (oyHakki <= 0) {
      setReklamModu(true); // Enerji bitince paneli aç
      return;
    }
    const foto = fotolar[index];
    if (foto.liked || !user) return;

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

  const enerjiTazele = async () => {
    if (!captchaToken) return;
    setReklamIzleniyor(true);
    setTimeout(async () => {
      const fullHak = 5;
      setOyHakki(fullHak);
      if (user) await supabase.from('profil').update({ oy_hakki: fullHak }).eq('id', user.id);
      setReklamIzleniyor(false);
      setReklamModu(false);
      setCaptchaToken(null);
    }, 2000);
  };

  if (!user) return <main className="h-screen flex items-center justify-center bg-black"><Login /></main>;

  return (
    <main className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide select-none">
      
      {/* ÜST BAR */}
      <div className="fixed top-0 left-0 w-full z-40 flex justify-between items-center p-6 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex flex-col">
          <h1 className="text-2xl font-black text-white italic tracking-tighter uppercase leading-none">CiciPet</h1>
          <div className="flex gap-3 mt-1 font-bold text-[10px] text-amber-400 uppercase italic">
            <span>⚡ {oyHakki} ENERJİ</span>
            <span>🏆 {toplamPuan} CP</span>
          </div>
        </div>
        <Link href="/profil" className="bg-white/10 backdrop-blur-xl border border-white/20 text-white px-6 py-2 rounded-full text-[11px] font-black uppercase italic tracking-widest">Profil 👤</Link>
      </div>

      {/* AKIŞ */}
      {fotolar.map((foto, index) => (
        <section key={foto.id + index} ref={fotolar.length === index + 1 ? sonElemanRef : null} className="h-screen w-full relative flex items-center justify-center snap-start bg-zinc-900">
          <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20" alt="" />
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img src={foto.foto_url} onDoubleClick={() => begeniAt(index)} className="max-h-[80vh] w-auto max-w-[95%] rounded-[3rem] shadow-2xl border-[6px] border-white/5 object-contain" alt="Pet" />

            {/* OY VER / ENERJİ AL BUTONU */}
            <div className="absolute right-4 bottom-24">
              <button onClick={() => begeniAt(index)} className="group flex flex-col items-center gap-2">
                <div className={`p-5 rounded-full shadow-2xl transition-all duration-300 ${foto.liked ? 'bg-red-600' : oyHakki === 0 ? 'bg-amber-500 animate-bounce' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}>
                  {oyHakki > 0 ? (
                    <span className="text-3xl">❤️</span>
                  ) : (
                    <span className="text-3xl">⚡</span>
                  )}
                </div>
                <span className={`text-[10px] font-black uppercase italic tracking-widest ${foto.liked ? 'text-red-500' : 'text-white'}`}>
                  {foto.liked ? 'Oylandı' : oyHakki === 0 ? 'Enerji Al' : 'Oy Ver'}
                </span>
              </button>
            </div>
          </div>
        </section>
      ))}

      {/* ENERJİ MODAL (POP-UP) */}
      {reklamModu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-xs p-8 rounded-[3rem] text-center shadow-2xl relative">
            <button onClick={() => setReklamModu(false)} className="absolute top-4 right-6 text-gray-400 font-bold text-xl">×</button>
            <h2 className="text-2xl font-black text-amber-600 uppercase italic mb-2 text-center">Enerji Bitti!</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-6 text-center">Devam etmek için robot olmadığını kanıtla</p>
            
            {reklamIzleniyor ? (
              <div className="py-10 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-amber-600 font-black italic uppercase text-xs">Enerji Yükleniyor...</p>
              </div>
            ) : (
              <div className="space-y-6 flex flex-col items-center">
                <Turnstile sitekey="0x4AAAAAACKO4jMEI3P1ys-3" onVerify={(token) => setCaptchaToken(token)} />
                <button 
                  onClick={enerjiTazele} 
                  disabled={!captchaToken} 
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase italic shadow-lg disabled:opacity-30"
                >
                  Enerji Tazele (+5)
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}