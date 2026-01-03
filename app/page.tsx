'use client';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Turnstile from 'react-turnstile';
import Login from './login';

export default function Home() {
  return (
    <Suspense fallback={<div className="bg-black h-screen w-full flex items-center justify-center text-amber-500 font-black italic uppercase">Yükleniyor...</div>}>
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
  const [reklamIzleniyor, setReklamIzleniyor] = useState(false);
  
  const [oylamaPaneli, setOylamaPaneli] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });
  const [secilenPuan, setSecilenPuan] = useState<number | null>(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);

  const searchParams = useSearchParams();
  const kategori = searchParams.get('kat') || 'kedi';
  const petId = searchParams.get('petId');

  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setFotolar([]);
    petGetir(true); 
    checkUser();
  }, [kategori, petId]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      fetchUserData(session.user.id);
    } else {
      setOyHakki(0);
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
      let url = `https://api.the${kategori === 'kopek' ? 'dog' : 'cat'}api.com/v1/images/search?limit=10`;
      const res = await fetch(url);
      const data = await res.json();
      
      let yeniPetler = data.map((pet: any) => ({
        id: pet.id,
        foto_url: pet.url,
        liked: false
      }));

      if (sifirla && petId) {
        const specRes = await fetch(`https://api.the${kategori === 'kopek' ? 'dog' : 'cat'}api.com/v1/images/${petId}`);
        if (specRes.ok) {
          const specData = await specRes.json();
          const specPet = { id: specData.id, foto_url: specData.url, liked: false };
          // TypeScript hatası için (p: any) eklendi
          yeniPetler = [specPet, ...yeniPetler.filter((p: any) => p.id !== petId)];
        }
      }

      setFotolar(prev => sifirla ? yeniPetler : [...prev, ...yeniPetler]);
    } catch (e) { console.error(e); }
    setLoading(false);
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
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (oyHakki !== null && oyHakki <= 0) { setReklamModu(true); return; }
    if (fotolar[index].liked) return;
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
      kopya[index].liked = true;
      return kopya;
    });

    setOylamaPaneli({ open: false, index: null });
    await supabase.from('profil').update({ oy_hakki: yeniHak, toplam_puan: yeniPuan }).eq('id', user.id);
    setTimeout(sonrakiPet, 500);
  };

  const paylas = async (id: string) => {
    const siteUrl = window.location.origin;
    const paylasimLink = `${siteUrl}/?kat=${kategori}&petId=${id}`;

    if (navigator.share) {
      try { 
        await navigator.share({ 
          title: 'CiciPet - En Tatlı Yarışma 🏆', 
          text: 'Bu tatlı pete bir baksana, sence kaç puan? 😍', 
          url: paylasimLink 
        }); 
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(paylasimLink);
      alert('Yarışma linki kopyalandı! 🐾');
    }
  };

  const cikisYap = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const enerjiTazele = async () => {
    if (!captchaToken || !user) return;
    setReklamIzleniyor(true);
    setTimeout(async () => {
      const fullHak = 5;
      setOyHakki(fullHak);
      await supabase.from('profil').update({ oy_hakki: fullHak }).eq('id', user.id);
      setReklamIzleniyor(false);
      setReklamModu(false);
      setCaptchaToken(null);
    }, 2000);
  };

  return (
    <main ref={scrollContainerRef} className="h-screen w-full bg-black overflow-y-scroll snap-y snap-mandatory scrollbar-hide select-none">
      
      <div className="fixed top-0 left-0 w-full z-50 p-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-xl flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between bg-white/10 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] shadow-2xl pointer-events-auto">
            
            <div className="flex items-center gap-4 sm:gap-6">
              <Link href="/" onClick={() => window.location.href='/'} className="flex flex-col pl-4 active:scale-95 group transition-transform">
                <h1 className="text-2xl sm:text-3xl font-black text-white italic group-hover:text-amber-500 tracking-tighter transition-colors leading-none">
                  Cici<span className="text-amber-500 group-hover:text-white">Pet</span>
                </h1>
                <p className="text-[7px] sm:text-[8px] font-bold text-white/40 uppercase tracking-[0.2em] mt-1 italic leading-none">En Tatlı Yarışma 🏆</p>
              </Link>

              <Link href="/kategoriler" className="text-white font-black italic text-[11px] sm:text-[12px] uppercase hover:text-amber-500 transition-colors border-l border-white/10 pl-4 py-2">
                Kategoriler
              </Link>
            </div>
            
            <div className="flex items-center gap-2 pr-2">
              <button 
                onClick={() => user ? (window.location.href='/profil') : setShowLoginModal(true)}
                className="flex items-center gap-2.5 bg-white/5 hover:bg-white/20 p-2 sm:p-2.5 rounded-full border border-white/10 transition-all active:scale-90 text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" />
                </svg>
                {toplamPuan > 0 && <span className="text-[11px] font-black italic pr-1 tracking-tighter text-amber-500">{toplamPuan} CP</span>}
              </button>

              {user && (
                <button onClick={cikisYap} className="bg-red-500/10 p-2.5 rounded-full border border-red-500/10 text-red-500 active:scale-90 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                </button>
              )}
            </div>
          </div>
          {user && oyHakki !== null && (
            <div className="bg-amber-500 px-6 py-1 rounded-full shadow-lg text-[10px] font-black italic text-black uppercase pointer-events-auto border border-amber-600 animate-pulse">
              ⚡ {oyHakki} ENERJİ
            </div>
          )}
        </div>
      </div>

      {fotolar.map((foto, index) => (
        <section key={foto.id + index} ref={fotolar.length === index + 1 ? sonElemanRef : null} className="h-screen w-full relative flex items-center justify-center snap-start snap-always bg-zinc-900">
          <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20" alt="" />
          <div className="relative w-full h-full flex items-center justify-center p-4 pt-24">
            <img 
              src={foto.foto_url} 
              onDoubleClick={() => oylamaAc(index)} 
              className="max-h-[75vh] w-auto max-w-[95%] rounded-[3rem] shadow-2xl border-[6px] border-white/5 object-contain" 
              alt="Pet" 
            />
            
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
              <button onClick={() => paylas(foto.id)} className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white active:scale-90 shadow-xl transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-10.628a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0 10.628a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /></svg>
              </button>
              
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => oylamaAc(index)} className={`p-5 rounded-full shadow-2xl transition-all duration-300 active:scale-90 ${foto.liked ? 'bg-green-600 scale-110' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}>
                  <span className="text-3xl">{foto.liked ? '✅' : '⭐'}</span>
                </button>
                <span className="text-[10px] font-black text-white uppercase italic drop-shadow-md">{foto.liked ? 'Bitti' : 'Puan Ver'}</span>
              </div>
            </div>
            <button onClick={sonrakiPet} className="absolute left-6 bottom-24 p-4 rounded-full bg-white/5 border border-white/10 text-amber-500 animate-bounce active:scale-95 transition-all shadow-xl"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg></button>
          </div>
        </section>
      ))}

      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl relative text-center">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-8 text-white/20 hover:text-white font-bold text-xl">×</button>
            <div className="mb-8">
              <h2 className="text-2xl font-black text-white italic tracking-tighter">Cici<span className="text-amber-500">Pet</span></h2>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-[0.2em] mt-2 italic">Giriş Yap ve Oylamaya Başla</p>
            </div>
            <Login /> 
          </div>
        </div>
      )}

      {oylamaPaneli.open && user && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl">
            <h3 className="text-white text-center font-black italic uppercase text-lg mb-6 tracking-tighter">Puan Ver</h3>
            <div className="flex justify-between mb-8 px-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button key={p} type="button" onClick={() => setSecilenPuan(p)} className={`w-12 h-12 rounded-2xl font-black text-xl flex items-center justify-center transition-all active:scale-90 border-2 ${secilenPuan === p ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-110' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}>
                  {p}
                </button>
              ))}
            </div>
            <div className="h-px bg-white/10 w-full mb-8"></div>
            <h3 className="text-white text-center font-black italic uppercase text-lg mb-6 tracking-tighter">Sence Nasıl?</h3>
            <div className="grid grid-cols-1 gap-3">
              {['😎 Karizmatik', '🥰 Çok Tatlı', '🎀 Çok Güzel', '🤪 Çok Komik', '👹 Çirkin ama Tatlı'].map((label, i) => (
                <button key={i} type="button" onClick={() => oyVer(label)} disabled={secilenPuan === null} className={`w-full py-4 rounded-2xl border font-bold text-sm flex items-center justify-center gap-3 transition-all active:scale-95 ${secilenPuan === null ? 'bg-white/5 border-white/5 text-white/10 cursor-not-allowed' : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'}`}>
                  {label}
                </button>
              ))}
            </div>
            <button type="button" onClick={() => setOylamaPaneli({ open: false, index: null })} className="w-full mt-6 text-white/20 font-bold text-[10px] uppercase tracking-widest hover:text-white transition-colors">Vazgeç</button>
          </div>
        </div>
      )}

      {reklamModu && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-xs p-8 rounded-[3rem] text-center shadow-2xl relative text-black">
            <button onClick={() => setReklamModu(false)} className="absolute top-4 right-6 text-gray-400 font-bold text-xl">×</button>
            <h2 className="text-2xl font-black text-amber-600 uppercase italic mb-6">Enerji Lazım!</h2>
            <Turnstile sitekey="0x4AAAAAACKO4jMEI3P1ys-3" onVerify={(token) => setCaptchaToken(token)} />
            <button onClick={enerjiTazele} disabled={!captchaToken} className="w-full mt-4 py-4 rounded-2xl bg-black text-white font-black uppercase italic shadow-lg active:scale-95 disabled:opacity-20 transition-all">Enerji Tazele (+5)</button>
          </div>
        </div>
      )}
    </main>
  );
}