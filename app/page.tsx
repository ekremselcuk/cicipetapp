'use client';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
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
  
  const [oylamaPaneli, setOylamaPaneli] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });
  const [secilenPuan, setSecilenPuan] = useState<number | null>(null); 
  const [showLoginModal, setShowLoginModal] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();
  const kategori = searchParams.get('kat') || 'kedi';
  const petId = searchParams.get('petId');

  const observer = useRef<IntersectionObserver | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);

  const kategoriler = [
    { id: 'kedi', label: '🐱 Kedi' },
    { id: 'kopek', label: '🐶 Köpek' },
    { id: 'bird', label: '🦜 Kuş' },
    { id: 'reptile', label: '🦎 Sürüngen' },
    { id: 'hamster', label: '🐹 Hamster' },
    { id: 'other', label: '✨ Diğer' }
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
      // API her kategori için aynı olmayabilir, şimdilik mantığı kurduk
      let url = `https://api.the${kategori === 'kopek' ? 'dog' : 'cat'}api.com/v1/images/search?limit=10`;
      if (kategori !== 'kedi' && kategori !== 'kopek') {
        url = `https://api.thecatapi.com/v1/images/search?limit=10`; // Diğerleri için fallback
      }
      
      const res = await fetch(url);
      const data = await res.json();
      
      let yeniPetler = data.map((pet: any) => ({
        id: pet.id,
        foto_url: pet.url,
        liked: false
      }));

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

  const paylas = async () => {
    const foto = fotolar[activeScrollIndex];
    if (!foto) return;
    const siteUrl = window.location.origin;
    const paylasimLink = `${siteUrl}/?kat=${kategori}&petId=${foto.id}`;
    
    if (navigator.share) {
      try { 
        await navigator.share({ 
          title: 'CiciPet', 
          text: 'Bu tatlılığa kaç puan verirsin? 😍', 
          url: paylasimLink 
        }); 
      } catch (e) {}
    } else {
      navigator.clipboard.writeText(paylasimLink);
      alert('Link kopyalandı! 🐾');
    }
  };

  return (
    <main className="h-screen w-full bg-black overflow-hidden relative select-none">
      
      {/* 1. ÜST SABİT BAR: LOGO VE ENERJİ */}
      <div className="fixed top-0 left-0 w-full z-[60] p-4 flex flex-col items-center gap-3 bg-gradient-to-b from-black/80 to-transparent">
        <div className="w-full max-w-xl flex items-center justify-between bg-white/10 backdrop-blur-md border border-white/10 p-3 rounded-[2rem]">
          <Link href="/" className="pl-4">
            <h1 className="text-2xl font-black text-white italic tracking-tighter">Cici<span className="text-amber-500">Pet</span></h1>
          </Link>
          <div className="flex items-center gap-2 pr-2">
             <button onClick={() => user ? (window.location.href='/profil') : setShowLoginModal(true)} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-white text-xs font-bold">
               {toplamPuan} CP
             </button>
          </div>
        </div>

        {/* 2. KATEGORİ CHIPS (SABİT) */}
        <div className="w-full max-w-xl overflow-x-auto scrollbar-hide flex items-center gap-2 px-2">
          {kategoriler.map((kat) => (
            <button
              key={kat.id}
              onClick={() => router.push(`/?kat=${kat.id}`)}
              className={`whitespace-nowrap px-5 py-2 rounded-full text-[11px] font-black uppercase italic transition-all border ${kategori === kat.id ? 'bg-amber-500 border-amber-400 text-black scale-105' : 'bg-white/5 border-white/10 text-white/60'}`}
            >
              {kat.label}
            </button>
          ))}
        </div>
        
        {user && oyHakki !== null && (
          <div className="bg-amber-500 px-4 py-0.5 rounded-full text-[9px] font-black text-black uppercase animate-pulse">⚡ {oyHakki} ENERJİ</div>
        )}
      </div>

      {/* 3. SCROLL EDİLEN ALAN (SADECE FOTOĞRAFLAR) */}
      <div 
        ref={scrollContainerRef} 
        onScroll={handleScroll}
        className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {fotolar.map((foto, index) => (
          <section key={foto.id + index} ref={fotolar.length === index + 1 ? sonElemanRef : null} className="h-screen w-full flex items-center justify-center snap-start snap-always relative">
            <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-10" alt="" />
            
            {/* FOTOĞRAF KONTEYNERİ (SABİT BOYUT) */}
            <div className="relative w-full max-w-md aspect-square px-4">
              <img 
                src={foto.foto_url} 
                onDoubleClick={() => oylamaAc(index)}
                className="w-full h-full object-cover rounded-[3rem] shadow-2xl border-4 border-white/10 bg-zinc-800"
                alt="Pet" 
              />
            </div>
          </section>
        ))}
      </div>

      {/* 4. ALT SABİT AKSİYON BARI (ÇİVİLENDİ) */}
      <div className="fixed bottom-10 left-0 w-full z-[60] flex justify-center px-4 pointer-events-none">
        <div className="bg-white/5 backdrop-blur-2xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center gap-3 pointer-events-auto">
          
          {/* SCROLL BUTONU */}
          <button onClick={sonrakiPet} className="p-4 rounded-full bg-white/5 text-amber-500 hover:bg-white/10 active:scale-90 transition-all border border-white/5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
          </button>

          {/* PAYLAŞ BUTONU */}
          <button onClick={paylas} className="flex items-center gap-2 px-6 py-4 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all border border-white/10 font-black italic text-xs uppercase">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg>
            Paylaş
          </button>

          {/* PUAN BUTONU */}
          <button 
            onClick={() => oylamaAc(activeScrollIndex)} 
            className={`flex items-center gap-2 px-6 py-4 rounded-full transition-all active:scale-90 border font-black italic text-xs uppercase ${fotolar[activeScrollIndex]?.liked ? 'bg-green-500 border-green-400 text-white' : 'bg-amber-500 border-amber-400 text-black hover:bg-amber-400'}`}
          >
            <span className="text-lg leading-none">{fotolar[activeScrollIndex]?.liked ? '✅' : '⭐'}</span>
            {fotolar[activeScrollIndex]?.liked ? 'Bitti' : 'Puan Ver'}
          </button>

        </div>
      </div>

      {/* MODALLAR (LOGIN, OYLAMA VS.) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl relative text-center">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-8 text-white/20 hover:text-white font-bold text-xl">×</button>
            <h2 className="text-2xl font-black text-white italic mb-6">Cici<span className="text-amber-500">Pet</span></h2>
            <Login /> 
          </div>
        </div>
      )}

      {oylamaPaneli.open && user && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl">
            <h3 className="text-white text-center font-black italic uppercase mb-6">Puan Ver</h3>
            <div className="flex justify-between mb-8 px-2">
              {[1, 2, 3, 4, 5].map((p) => (
                <button key={p} onClick={() => setSecilenPuan(p)} className={`w-12 h-12 rounded-2xl font-black text-xl transition-all border-2 ${secilenPuan === p ? 'bg-amber-500 text-black border-amber-400 scale-110' : 'bg-white/5 border-white/10 text-white/40'}`}>{p}</button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {['😎 Karizmatik', '🥰 Çok Tatlı', '🎀 Çok Güzel', '🤪 Çok Komik', '👹 Çirkin'].map((label, i) => (
                <button key={i} onClick={() => oyVer(label)} disabled={secilenPuan === null} className="w-full py-4 rounded-2xl border border-white/10 bg-white/5 text-white font-bold disabled:opacity-20">{label}</button>
              ))}
            </div>
            <button onClick={() => setOylamaPaneli({ open: false, index: null })} className="w-full mt-6 text-white/20 font-bold uppercase text-[10px]">Vazgeç</button>
          </div>
        </div>
      )}

      {reklamModu && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 bg-black/95">
          <div className="bg-white w-full max-w-xs p-8 rounded-[3rem] text-center shadow-2xl">
            <h2 className="text-2xl font-black text-amber-600 uppercase italic mb-6">Enerji Lazım!</h2>
            <Turnstile sitekey="0x4AAAAAACKO4jMEI3P1ys-3" onVerify={(token) => setCaptchaToken(token)} />
            <button onClick={() => window.location.reload()} className="w-full mt-4 py-4 rounded-2xl bg-black text-white font-black uppercase italic">Kapat</button>
          </div>
        </div>
      )}
    </main>
  );
}