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
    const sloganlar = [
      "Günün en tatlı şeyiyle tanışmaya hazır mısın? 🥰 Puanını ver, zirveye taşıyalım! 🚀🐾",
      "Bu tatlılık gerçek olamaz! 😍 Sence 5 puanı hak etmiyor mu? Hemen oyla! 🏆",
      "Hala buna puan vermeyenler varmış...🥺 Bu masumiyete kaç puan verirsin? ✨",
      "Gördüğüm en karizmatik pet olabilir! 😎 Sence de öyle mi? Oyla! 🔥",
      "Şu bakışlara bir puan ver de keyfimiz yerine gelsin! 🎀🐾",
      "Telefonun ekranını ısırasım geldi! 🥰 Acil puanına ihtiyacımız var! 🚑"
    ];
    const rastgeleSlogan = sloganlar[Math.floor(Math.random() * sloganlar.length)];

    if (navigator.share) {
      try { await navigator.share({ title: 'CiciPet', text: rastgeleSlogan, url: paylasimLink }); } catch (e) {}
    } else {
      navigator.clipboard.writeText(paylasimLink);
      alert('Link kopyalandı! 🐾');
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
      
      {/* ÜST BAR */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-xl flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between bg-white/10 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] shadow-2xl pointer-events-auto">
            <div className="flex items-center gap-4">
              <Link href="/" onClick={() => window.location.href='/'} className="flex flex-col pl-4 group">
                <h1 className="text-2xl font-black text-white italic group-hover:text-amber-500 transition-colors tracking-tighter">Cici<span className="text-amber-500 group-hover:text-white">Pet</span></h1>
              </Link>
              <Link href="/kategoriler" className="text-white font-black italic text-[11px] uppercase border-l border-white/10 pl-4 py-2 hover:text-amber-500">Kategoriler</Link>
            </div>
            <div className="flex items-center gap-2 pr-2">
              <button onClick={() => user ? (window.location.href='/profil') : setShowLoginModal(true)} className="flex items-center gap-2 bg-white/5 p-2.5 rounded-full border border-white/10 text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a5 5 0 1 1 -5 5l.005 -.217a5 5 0 0 1 4.995 -4.783z" /><path d="M14 14a5 5 0 0 1 5 5v1a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-1a5 5 0 0 1 5 -5h4z" /></svg>
                {toplamPuan > 0 && <span className="text-[11px] font-black text-amber-500">{toplamPuan} CP</span>}
              </button>
            </div>
          </div>
          {user && oyHakki !== null && (
            <div className="bg-amber-500 px-6 py-1 rounded-full text-[10px] font-black text-black uppercase border border-amber-600 animate-pulse">⚡ {oyHakki} ENERJİ</div>
          )}
        </div>
      </div>

      {/* AKIŞ */}
      {fotolar.map((foto, index) => (
        <section key={foto.id + index} ref={fotolar.length === index + 1 ? sonElemanRef : null} className="h-screen w-full relative flex items-center justify-center snap-start snap-always bg-zinc-900">
          <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20" alt="" />
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            
            {/* GÖRSEL */}
            <img 
              src={foto.foto_url} 
              onDoubleClick={() => oylamaAc(index)} 
              className="max-h-[65vh] w-auto max-w-[95%] rounded-[3rem] shadow-2xl border-[6px] border-white/5 object-contain" 
              alt="Pet" 
            />
            
            {/* YENİ ALT AKSİYON BARI (Sihirli Dokunuş) */}
            <div className="mt-8 flex items-center gap-3 bg-white/5 backdrop-blur-xl p-3 rounded-[2.5rem] border border-white/10 shadow-2xl">
              
              {/* SCROLL BUTONU (Sol) */}
              <button onClick={sonrakiPet} className="p-4 rounded-full bg-white/5 text-amber-500 hover:bg-white/10 active:scale-90 transition-all border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg>
              </button>

              {/* PAYLAŞ BUTONU (Orta - Yeni İkon) */}
              <button onClick={() => paylas(foto.id)} className="flex items-center gap-2 px-6 py-4 rounded-full bg-white/10 text-white hover:bg-white/20 active:scale-90 transition-all border border-white/10 font-black italic text-xs uppercase tracking-tight">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M3 12a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M15 6a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M15 18a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" /><path d="M8.7 10.7l6.6 -3.4" /><path d="M8.7 13.3l6.6 3.4" /></svg>
                Paylaş
              </button>

              {/* PUAN BUTONU (Sağ) */}
              <button onClick={() => oylamaAc(index)} className={`flex items-center gap-2 px-6 py-4 rounded-full transition-all active:scale-90 border font-black italic text-xs uppercase tracking-tight ${foto.liked ? 'bg-green-500 border-green-400 text-white' : 'bg-amber-500 border-amber-400 text-black hover:bg-amber-400'}`}>
                <span className="text-lg leading-none">{foto.liked ? '✅' : '⭐'}</span>
                {foto.liked ? 'Oylandı' : 'Puan Ver'}
              </button>

            </div>

          </div>
        </section>
      ))}

      {/* MODALLAR */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm p-8 rounded-[3.5rem] shadow-2xl relative text-center">
            <button onClick={() => setShowLoginModal(false)} className="absolute top-6 right-8 text-white/20 hover:text-white font-bold text-xl">×</button>
            <h2 className="text-2xl font-black text-white italic">Cici<span className="text-amber-500">Pet</span></h2>
            <Login /> 
          </div>
        </div>
      )}

      {oylamaPaneli.open && user && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
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
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/90">
          <div className="bg-white w-full max-w-xs p-8 rounded-[3rem] text-center shadow-2xl">
            <h2 className="text-2xl font-black text-amber-600 uppercase italic mb-6">Enerji Lazım!</h2>
            <Turnstile sitekey="0x4AAAAAACKO4jMEI3P1ys-3" onVerify={(token) => setCaptchaToken(token)} />
            <button onClick={enerjiTazele} disabled={!captchaToken} className="w-full mt-4 py-4 rounded-2xl bg-black text-white font-black uppercase italic disabled:opacity-20">Enerji Tazele (+5)</button>
          </div>
        </div>
      )}
    </main>
  );
}