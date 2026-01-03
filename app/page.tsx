'use client';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import Turnstile from 'react-turnstile';
import Login from './login';

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-black h-screen w-full flex items-center justify-center text-cyan-400 font-black italic uppercase">Yükleniyor...</div>}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const [fotolar, setFotolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [oyHakki, setOyHakki] = useState<number | null>(null); 
  const [toplamPuan, setToplamPuan] = useState(0);
  const [reklamModu, setReklamModu] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  
  const [oylamaPaneli, setOylamaPaneli] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });
  const [secilenPuan, setSecilenPuan] = useState<number | null>(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const kategori = searchParams.get('kat'); // Başta null gelecek

  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);

  const kategoriler = [
    { id: 'kedi', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/></svg> },
    { id: 'kopek', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11.25 16.25h1.5L12 17z"/><path d="M16 14v.5"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"/><path d="M8 14v.5"/><path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/></svg> },
    { id: 'bird', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg> },
    { id: 'hamster', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 22H4a2 2 0 0 1 0-4h12"/><path d="M13.236 18a3 3 0 0 0-2.2-5"/><path d="M16 9h.01"/><path d="M16.82 3.94a3 3 0 1 1 3.237 4.868l1.815 2.587a1.5 1.5 0 0 1-1.5 2.1l-2.872-.453a3 3 0 0 0-3.5 3"/><path d="M17 4.988a3 3 0 1 0-5.2 2.052A7 7 0 0 0 4 14.015 4 4 0 0 0 8 18"/></svg> },
    { id: 'reptile', icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 12-1.5 3"/><path d="M19.63 18.81 22 20"/><path d="M6.47 8.23a1.68 1.68 0 0 1 2.44 1.93l-.64 2.08a6.76 6.76 0 0 0 10.16 7.67l.42-.27a1 1 0 1 0-2.73-4.21l-.42.27a1.76 1.76 0 0 1-2.63-1.99l.64-2.08A6.66 6.66 0 0 0 3.94 3.9l-.7.4a1 1 0 1 0 2.55 4.34z"/></svg> }
  ];

  useEffect(() => {
    setFotolar([]);
    petGetir(true); 
    checkUser();
  }, [kategori]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchUserData(session.user.id);
    }
  };

  const fetchUserData = async (userId: string) => {
    const { data } = await supabase.from('profil').select('oy_hakki, toplam_puan').eq('id', userId).single();
    if (data) {
      setOyHakki(data.oy_hakki);
      setToplamPuan(data.toplam_puan || 0);
    }
  };

  const petGetir = async (sifirla = false) => {
    if (loading) return;
    setLoading(true);
    try {
      const katQuery = kategori || 'kedi'; // Default kedi ama ikon seçili gelmeyecek
      let apiKategori = katQuery === 'kopek' ? 'dog' : 'cat';
      const res = await fetch(`https://api.the${apiKategori}api.com/v1/images/search?limit=10`);
      const data = await res.json();
      const yeniPetler = data.map((pet: any) => ({ id: pet.id, foto_url: pet.url, liked: false }));
      setFotolar(prev => sifirla ? yeniPetler : [...prev, ...yeniPetler]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleScroll = (e: any) => {
    const index = Math.round(e.target.scrollTop / window.innerHeight);
    setActiveScrollIndex(index);
  };

  const sonElemanRef = useCallback((node: any) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) petGetir();
    });
    if (node) observer.current.observe(node);
  }, [loading]);

  const sonrakiPet = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  const oylamaAc = (index: number) => {
    if (!user) { setShowLoginModal(true); return; }
    if (oyHakki !== null && oyHakki <= 0) { setReklamModu(true); return; }
    if (fotolar[index]?.liked) return;
    setSecilenPuan(null); 
    setOylamaPaneli({ open: true, index });
  };

  const oyVer = async (etiket: string) => {
    if (secilenPuan === null || !user || oyHakki === null) return;
    const index = oylamaPaneli.index;
    if (index === null) return;

    const yeniHak = oyHakki - 1;
    const yeniPuan = toplamPuan + secilenPuan;

    setOyHakki(yeniHak);
    setToplamPuan(yeniPuan);
    setFotolar(prev => {
      const kopya = [...prev];
      if (kopya[index]) kopya[index].liked = true;
      return kopya;
    });

    setOylamaPaneli({ open: false, index: null });
    await supabase.from('profil').update({ oy_hakki: yeniHak, toplam_puan: yeniPuan }).eq('id', user.id);
    setTimeout(sonrakiPet, 500);
  };

  const cikisYap = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  return (
    <main className="h-screen w-full bg-black overflow-hidden relative select-none">
      
      {/* ÜST SABİT BAR */}
      <div className="fixed top-0 left-0 w-full z-[60] flex flex-col items-center pt-6 pb-10 bg-gradient-to-b from-black via-black/90 to-transparent">
        <div className="w-full max-w-md flex items-center justify-between px-6 mb-4 pointer-events-auto">
          <div className="flex flex-col">
            <h1 onClick={() => window.location.href='/'} className="text-2xl font-black text-white italic tracking-tighter cursor-pointer active:scale-95 transition-transform">
              Cici<span className="text-cyan-400">Pet</span>
            </h1>
            <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] italic">En Tatlı Yarışma 🏆</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => user ? (window.location.href='/profil') : setShowLoginModal(true)}
              className="flex items-center gap-2 bg-white/5 p-2.5 rounded-full border border-white/10 text-white active:scale-90"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" /></svg>
              {toplamPuan > 0 && <span className="text-[11px] font-black text-cyan-400">{toplamPuan} CP</span>}
            </button>
            
            {user && (
              <button onClick={cikisYap} className="bg-red-500/10 p-2.5 rounded-full border border-red-500/20 text-red-500 active:scale-90">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
              </button>
            )}
          </div>
        </div>

        {/* KATEGORİ İKONLARI */}
        <div className="w-full max-w-xs flex justify-around items-center bg-white/5 backdrop-blur-xl p-2 rounded-full border border-white/10 shadow-2xl pointer-events-auto">
          {kategoriler.map((kat) => (
            <button
              key={kat.id}
              onClick={() => router.push(`/?kat=${kat.id}`)}
              className={`p-3 rounded-full transition-all active:scale-90 ${kategori === kat.id ? 'bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.5)] scale-110' : 'text-white/40 hover:text-white'}`}
            >
              {kat.icon}
            </button>
          ))}
        </div>

        {user && oyHakki !== null && (
          <div className="mt-4 bg-cyan-400 px-4 py-0.5 rounded-full text-[9px] font-black text-black uppercase animate-pulse">⚡ {oyHakki} ENERJİ</div>
        )}
      </div>

      {/* SCROLL ALANI */}
      <div 
        ref={scrollContainerRef} 
        onScroll={handleScroll}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {fotolar.map((foto, index) => (
          <section key={foto.id + index} ref={fotolar.length === index + 1 ? sonElemanRef : null} className="h-screen w-full flex items-center justify-center snap-start snap-always relative">
            <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-10" alt="" />
            <div className="relative w-full max-w-sm aspect-square px-4">
              <img 
                src={foto.foto_url} 
                onDoubleClick={() => oylamaAc(index)}
                className="w-full h-full object-cover rounded-[3.5rem] shadow-2xl border-4 border-white/5 bg-zinc-800 transition-transform duration-500"
                alt="Pet" 
              />
            </div>
          </section>
        ))}
      </div>

      {/* ALT SABİT AKSİYON BARI */}
      <div className="fixed bottom-12 left-0 w-full z-[60] flex justify-center px-4 pointer-events-none">
        <div className="bg-white/10 backdrop-blur-3xl p-3 rounded-[3rem] border border-white/10 shadow-2xl flex items-center gap-4 pointer-events-auto">
          
          <button onClick={sonrakiPet} className="p-4 rounded-full bg-white/5 text-cyan-400 active:scale-75 transition-all border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
          </button>

          <button className="flex items-center gap-2 px-6 py-4 rounded-full bg-white/5 text-white active:scale-90 transition-all border border-white/5 font-black italic text-xs uppercase tracking-widest">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg>
            Paylaş
          </button>

          <button 
            onClick={() => oylamaAc(activeScrollIndex)} 
            className={`flex items-center gap-2 px-6 py-4 rounded-full transition-all active:scale-95 border font-black italic text-xs uppercase ${fotolar[activeScrollIndex]?.liked ? 'bg-green-500 border-green-400 text-white' : 'bg-cyan-400 border-cyan-300 text-black shadow-lg shadow-cyan-400/20'}`}
          >
            <span className="text-xl leading-none">{fotolar[activeScrollIndex]?.liked ? '✅' : '⭐'}</span>
            {fotolar[activeScrollIndex]?.liked ? 'Bitti' : 'Puan Ver'}
          </button>
        </div>
      </div>

      {/* MODALLAR */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm p-8 rounded-[4rem] shadow-2xl relative">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-8 right-8 text-white/40 hover:text-white font-bold text-xl">×</button>
            <Login /> 
          </div>
        </div>
      )}

      {oylamaPaneli.open && user && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm p-8 rounded-[4rem] shadow-2xl">
            <h3 className="text-white text-center font-black italic uppercase tracking-widest mb-8">Puan Ver</h3>
            <div className="flex justify-between mb-10 px-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button key={p} onClick={() => setSecilenPuan(p)} className={`w-12 h-12 rounded-2xl font-black text-xl transition-all border-2 ${secilenPuan === p ? 'bg-cyan-400 text-black border-cyan-300 scale-110 shadow-lg shadow-cyan-400/30' : 'bg-white/5 border-white/10 text-white/40'}`}>{p}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {['😎 Karizmatik', '🥰 Çok Tatlı', '🎀 Çok Güzel', '🤪 Çok Komik', '👹 Çirkin'].map((label, i) => (
                <button key={i} onClick={() => oyVer(label)} disabled={secilenPuan === null} className="w-full py-4 rounded-3xl border border-white/10 bg-white/5 text-white font-bold tracking-tight active:scale-95 disabled:opacity-10">{label}</button>
              ))}
            </div>
            <button onClick={() => setOylamaPaneli({ open: false, index: null })} className="w-full mt-8 text-white/20 font-bold uppercase text-[10px] tracking-[0.3em]">Vazgeç</button>
          </div>
        </div>
      )}
    </main>
  );
}