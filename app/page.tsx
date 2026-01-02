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
  
  // Oylama Paneli Durumu
  const [oylamaPaneli, setOylamaPaneli] = useState<{ open: boolean, index: number | null }>({ open: false, index: null });

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

  const sonrakiPet = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    }
  };

  // Oylama Panelini Aç
  const oylamaAc = (index: number) => {
    if (oyHakki <= 0) {
      setReklamModu(true);
      return;
    }
    if (fotolar[index].liked) return;
    setOylamaPaneli({ open: true, index });
  };

  // Oyu Gönder
  const oyVer = async (puan: number, etiket: string) => {
    const index = oylamaPaneli.index;
    if (index === null || !user) return;

    const yeniHak = oyHakki - 1;
    const yeniPuan = toplamPuan + puan;

    setOyHakki(yeniHak);
    setToplamPuan(yeniPuan);
    setFotolar(prev => {
      const kopya = [...prev];
      kopya[index].liked = true;
      return kopya;
    });

    setOylamaPaneli({ open: false, index: null });

    // DB Güncelleme (Burada etiket bilgisini de logs tablosuna atabilirsin ileride)
    await supabase.from('profil').update({ oy_hakki: yeniHak, toplam_puan: yeniPuan }).eq('id', user.id);

    setTimeout(sonrakiPet, 500);
  };

  const paylas = async (url: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'CiciPet', text: 'Bu tatlı pete bir baksana! 😍', url: url });
      } catch (e) { console.log('İptal'); }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link kopyalandı! 🐾');
    }
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
    <main ref={scrollContainerRef} className="h-screen w-full bg-black overflow-y-scroll snap-y snap-stop snap-mandatory scrollbar-hide select-none">
      
      {/* ÜST BAR */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 flex justify-center pointer-events-none">
        <div className="w-full max-w-xl flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between bg-white/10 backdrop-blur-2xl border border-white/10 p-3 rounded-[2.5rem] shadow-2xl pointer-events-auto">
            <a href="/" className="flex flex-col pl-3 active:scale-95 group">
              <h1 className="text-xl font-black text-white italic group-hover:text-amber-500 transition-colors">Cici<span className="text-amber-500 group-hover:text-white">Pet</span></h1>
              <p className="text-[7px] font-bold text-white/40 uppercase tracking-[0.2em] mt-0.5 italic">En Tatlı Yarışma 🏆</p>
            </a>
            <div className="flex items-center gap-2 text-white">
               <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold border border-white/10 italic">🏆 {toplamPuan} CP</span>
               <button onClick={cikisYap} className="bg-red-500/10 p-2.5 rounded-full border border-red-500/10 text-red-500"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg></button>
            </div>
          </div>
          <div className="bg-amber-500 px-6 py-1 rounded-full shadow-lg text-[10px] font-black italic text-black uppercase pointer-events-auto border border-amber-600 animate-pulse">
            ⚡ {oyHakki} ENERJİ KALDI
          </div>
        </div>
      </div>

      {/* AKIŞ */}
      {fotolar.map((foto, index) => (
        <section key={foto.id + index} ref={fotolar.length === index + 1 ? sonElemanRef : null} className="h-screen w-full relative flex items-center justify-center snap-start snap-always bg-zinc-900">
          <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover blur-3xl opacity-20" alt="" />
          <div className="relative w-full h-full flex items-center justify-center p-4 pt-24">
            <img src={foto.foto_url} onDoubleClick={() => oylamaAc(index)} className="max-h-[75vh] w-auto max-w-[95%] rounded-[3rem] shadow-2xl border-[6px] border-white/5 object-contain" alt="Pet" />
            
            {/* SAĞ PANEL */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6">
              <button onClick={() => paylas(foto.foto_url)} className="p-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-white active:scale-90 shadow-xl"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0-10.628a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5zm0 10.628a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" /></svg></button>
              
              <div className="flex flex-col items-center gap-2">
                <button onClick={() => oylamaAc(index)} className={`p-5 rounded-full shadow-2xl transition-all duration-300 active:scale-90 ${foto.liked ? 'bg-green-600' : 'bg-white/10 backdrop-blur-md border border-white/20'}`}>
                  <span className="text-3xl">{foto.liked ? '✅' : '⭐'}</span>
                </button>
                <span className="text-[10px] font-black text-white uppercase italic tracking-tighter drop-shadow-md">{foto.liked ? 'Puan Verildi' : 'Puan Ver'}</span>
              </div>
            </div>

            {/* SOL PANEL */}
            <button onClick={sonrakiPet} className="absolute left-6 bottom-24 flex flex-col items-start group active:scale-95 transition-all">
              <span className="text-amber-400 font-black italic text-[10px] uppercase tracking-widest group-hover:text-white">Sıradaki Pet</span>
              <div className="flex items-center gap-2 mt-1">
                <div className="p-2 bg-amber-500 rounded-full shadow-lg animate-bounce"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={4} stroke="white" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" /></svg></div>
              </div>
            </button>
          </div>
        </section>
      ))}

      {/* MODAL: OYLAMA PANELİ (HIBRİT SİSTEM) */}
      {oylamaPaneli.open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 w-full max-w-sm p-8 rounded-[3.5rem] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <h3 className="text-white text-center font-black italic uppercase text-xl mb-6 tracking-tighter">Puanla & Vibe Seç!</h3>
            
            {/* 1-5 PUANLAMA */}
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4, 5].map((p) => (
                <button 
                  key={p} 
                  onClick={() => {}} // Seçim görselleştirme eklenebilir ama direkt etiketle bitirmek daha hızlı
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-amber-500 font-black text-xl flex items-center justify-center hover:bg-amber-500 hover:text-black transition-all active:scale-90"
                >
                  {p}
                </button>
              ))}
            </div>

            <div className="h-px bg-white/10 w-full mb-8"></div>

            {/* ETİKETLER (TIKLANINCA OY GÖNDERİLİR) */}
            <div className="grid grid-cols-1 gap-3">
              {[
                { e: '😎 Karizmatik', p: 5, t: 'Karizmatik' },
                { e: '🥰 Çok Tatlı', p: 4, t: 'Tatlı' },
                { e: '🎀 Çok Güzel', p: 3, t: 'Güzel' },
                { e: '🤪 Komik', p: 5, t: 'Komik' }, // Komik bulan 5 puan verebilsin diye p:5 yaptım
                { e: '👹 Çirkin ama Tatlı', p: 1, t: 'Çirkin' }
              ].map((obj) => (
                <button 
                  key={obj.t} 
                  onClick={() => oyVer(obj.p, obj.t)}
                  className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-3 hover:bg-white/10 active:scale-95 transition-all"
                >
                  <span className="text-xl">{obj.e.split(' ')[0]}</span>
                  {obj.e.split(' ').slice(1).join(' ')}
                </button>
              ))}
            </div>

            <button onClick={() => setOylamaPaneli({ open: false, index: null })} className="w-full mt-6 text-white/30 font-bold text-[10px] uppercase tracking-widest">Kapat</button>
          </div>
        </div>
      )}

      {/* REKLAM MODALI */}
      {reklamModu && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-xs p-8 rounded-[3rem] text-center shadow-2xl relative text-black">
            <button onClick={() => setReklamModu(false)} className="absolute top-4 right-6 text-gray-400 font-bold text-xl">×</button>
            <h2 className="text-2xl font-black text-amber-600 uppercase italic mb-2 font-mono">Enerji Bitti!</h2>
            <div className="space-y-6 flex flex-col items-center">
              <Turnstile sitekey="0x4AAAAAACKO4jMEI3P1ys-3" onVerify={(token) => setCaptchaToken(token)} />
              <button onClick={enerjiTazele} disabled={!captchaToken} className="w-full py-4 rounded-2xl bg-black text-white font-black uppercase italic shadow-lg active:scale-95 disabled:opacity-20">Enerji Tazele (+5)</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}