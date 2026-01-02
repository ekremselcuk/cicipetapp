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
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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
      setReklamModu(true);
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

    setTimeout(() => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
      }
    }, 700);
  };

  const cikisYap = async () => {
    await supabase.auth.signOut();
    window.location.reload();
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
    <main ref={scrollContainerRef} className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide select-none">
      
      {/* ÜST BAR VE ENERJİ SAYACI */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 flex flex-col items-center">
        <div className="w-full max-w-xl flex items-center justify-between bg-white/10 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] shadow-2xl relative z-20">
          <div className="flex flex-col pl-3">
            <h1 className="text-xl font-black text-white tracking-tighter leading-none italic">
              Cici<span className="text-amber-500">Pet</span>
            </h1>
            <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5 italic">
              En Tatlı Yarışma 🏆
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/kategoriler" className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 px-4 py-2 rounded-2xl text-[9px] font-black uppercase italic text-amber-500 transition-all flex items-center gap-2">
              📂 Kategoriler
            </Link>
            <Link href="/profil" className="bg-white/5 p-2.5 rounded-full border border-white/10 hover:bg-white/10 transition-all active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </Link>
            <button onClick={cikisYap} className="bg-red-500/10 p-2.5 rounded-full border border-red-500/10 hover:bg-red-500/20 transition-all active:scale-90">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#ef4444" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>

        <div className="relative z-10 -mt-2">
          <div className="bg-amber-500 px-6 py-1 rounded-b-2xl shadow-[0_10px_20px_rgba(245,158,11,0.4)] flex gap-4 text-[9px] font-black italic text-black uppercase border-x border-b border-amber-600">
            <span>⚡ {oyHakki} Enerji</span>
            <span className="opacity-30">|</span>
            <span>🏆 {toplamPuan} CP</span>
          </div>
        </div>
      </div>

      {/* AKIŞ */}
      {fotolar.map((foto, index) => (
        <section key={foto.id + index} ref={fotolar.length === index + 1 ? sonElemanRef : null} className="h-screen w-full relative flex items-center justify-center snap-start bg-zinc-900">
          <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20" alt="" />
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <img src={foto.foto_url} onDoubleClick={() => begeniAt(index)} className="max-h-[80vh] w-auto max-w-[95%] rounded-[3rem] shadow-2xl border-[6px] border-white/5 object-contain" alt="Pet" />
            
            <div className="absolute right-4 bottom-24 flex items-center gap-4">
              <div className="flex flex-col items-end drop-shadow-[0_2px_15px_rgba(0,0,0,1)] text-white">
                <span className="font-black italic text-base uppercase tracking-tighter">Beğendin mi? ❤️</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-400 font-black italic text-[10px] uppercase tracking-widest animate-pulse">Kaydır ve Keşfet</span>
                  <div className="animate-bounce bg-amber-500 p-1 rounded-full shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="white" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
                  </div>
                </div>
              </div>
              <button onClick={() => begeniAt(index)} className="group transition-transform active:scale-90">
                <div className={`p-5 rounded-full shadow-2xl transition-all duration-300 ${foto.liked ? 'bg-red-600 scale-110' : oyHakki === 0 ? 'bg-amber-500 animate-bounce' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}>
                  <span className="text-3xl">{oyHakki > 0 ? '❤️' : '⚡'}</span>
                </div>
              </button>
            </div>
          </div>
        </section>
      ))}

      {/* ENERJİ MODAL */}
      {reklamModu && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md">
          <div className="bg-white w-full max-w-xs p-8 rounded-[3rem] text-center shadow-2xl relative text-black">
            <button onClick={() => setReklamModu(false)} className="absolute top-4 right-6 text-gray-400 font-bold text-xl">×</button>
            <h2 className="text-2xl font-black text-amber-600 uppercase italic mb-2">Enerji Bitti!</h2>
            <p className="text-gray-500 text-[10px] font-bold uppercase mb-6">Robot olmadığını kanıtla</p>
            {reklamIzleniyor ? (
              <div className="py-10 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-amber-600 font-black italic uppercase text-[10px]">Yükleniyor...</p>
              </div>
            ) : (
              <div className="space-y-6 flex flex-col items-center">
                <Turnstile sitekey="0x4AAAAAACKO4jMEI3P1ys-3" onVerify={(token) => setCaptchaToken(token)} />
                <button onClick={enerjiTazele} disabled={!captchaToken} className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black uppercase italic shadow-lg disabled:opacity-30 active:scale-95 transition-all">
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