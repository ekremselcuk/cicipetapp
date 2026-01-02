'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Login from './login';
import Link from 'next/link';
import Turnstile from 'react-turnstile';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [puan, setPuan] = useState(0);
  const [oyHakki, setOyHakki] = useState(5);
  const [reklamIzleniyor, setReklamIzleniyor] = useState(false);
  const [mevcutFoto, setMevcutFoto] = useState<any>(null);
  const [oyVeriyor, setOyVeriyor] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        await fetchUserData(session.user.id);
        yeniFotoGetir();
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data } = await supabase.from('profil').select('toplam_puan, oy_hakki').eq('id', userId).single();
    if (data) {
      setPuan(data.toplam_puan || 0);
      setOyHakki(data.oy_hakki ?? 5);
    }
  };

  const yeniFotoGetir = async () => {
    const { data } = await supabase.from('fotolar').select('*');
    if (data && data.length > 0) {
      const rastgeleIndex = Math.floor(Math.random() * data.length);
      setMevcutFoto(data[rastgeleIndex]);
    }
  };

  const oyVer = async () => {
    if (oyVeriyor || oyHakki <= 0 || !user || !mevcutFoto) return;
    setOyVeriyor(true);
    const yeniHak = oyHakki - 1;
    const yeniPuan = puan + 1;
    setOyHakki(yeniHak);
    setPuan(yeniPuan);

    try {
      await supabase.from('profil').update({ toplam_puan: yeniPuan, oy_hakki: yeniHak }).eq('id', user.id);
      if (mevcutFoto.id !== 'default') {
        const { data: fotoData } = await supabase.from('fotolar').select('puan').eq('id', mevcutFoto.id).single();
        await supabase.from('fotolar').update({ puan: (fotoData?.puan || 0) + 1 }).eq('id', mevcutFoto.id);
      }
      yeniFotoGetir();
    } finally {
      setTimeout(() => setOyVeriyor(false), 500);
    }
  };

  const reklamIzle = async () => {
    if (!captchaToken) return;
    setReklamIzleniyor(true);
    setTimeout(async () => { 
      const fullHak = 5;
      setOyHakki(fullHak); 
      if (user) {
        await supabase.from('profil').update({ oy_hakki: fullHak }).eq('id', user.id);
      }
      setReklamIzleniyor(false); 
      setCaptchaToken(null);
    }, 3000);
  };

  const cikisYap = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase italic">Yükleniyor...</div>;
  if (!user) return <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 p-8 text-center font-sans"><h1 className="text-5xl font-black text-amber-600 mb-4 tracking-tighter uppercase italic">CiciPet</h1><Login /></main>;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans pb-20">
      
      {/* ÜST BAR (Geri geldi!) */}
      <div className="w-full max-w-sm flex justify-between items-center gap-2 mb-4">
        <Link href="/kesfet" className="flex-1 text-[10px] font-black text-blue-600 bg-white px-3 py-3 rounded-2xl uppercase text-center shadow-md border-2 border-blue-100 italic">Keşfet 🌍</Link>
        <Link href="/profil" className="flex-1 text-[10px] font-black text-amber-600 bg-white px-3 py-3 rounded-2xl uppercase text-center shadow-md border-2 border-amber-100 italic">Profil 👤</Link>
        <button onClick={cikisYap} className="text-[10px] font-black text-red-500 bg-white px-3 py-3 rounded-2xl uppercase shadow-md border-2 border-red-100">Çıkış</button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl text-center border-8 border-white w-full max-w-sm relative mb-8">
        <div className="mb-1 text-gray-400 font-bold text-xs uppercase tracking-widest">Puanın</div>
        <div className="text-6xl mb-6 font-black text-amber-500">{puan} <span className="text-xl italic lowercase text-amber-300">cp</span></div>
        <div className="mb-2 text-amber-600 font-black text-sm uppercase italic">Kalan Enerji: {oyHakki}</div>

        <div className="relative w-full h-80 rounded-3xl overflow-hidden bg-gray-50 border-4 border-white shadow-inner mb-6">
          {reklamIzleniyor ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 bg-amber-50">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-amber-600 font-bold text-sm uppercase italic">Enerji Doluyor...</p>
            </div>
          ) : (
            <img key={mevcutFoto?.foto_url} src={mevcutFoto?.foto_url} alt="Pet" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="space-y-4">
          <button 
            onClick={oyVer} 
            disabled={oyHakki === 0 || reklamIzleniyor || oyVeriyor} 
            className="w-full font-black py-4 rounded-2xl text-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50 uppercase italic"
          >
            {oyVeriyor ? "⏳" : (oyHakki > 0 ? "Bayıldım! 🐾" : "Enerji Bitti")}
          </button>

          {oyHakki === 0 && !reklamIzleniyor && (
            <div className="flex flex-col items-center gap-3 p-3 bg-blue-50 rounded-2xl border-2 border-blue-100">
              <p className="text-[10px] font-bold text-blue-500 uppercase italic text-center">Enerji için robot olmadığını kanıtla:</p>
              <Turnstile 
                sitekey="0x4AAAAAACKO4jMEI3P1ys-3" 
                onVerify={(token) => setCaptchaToken(token)} 
              />
              <button 
                onClick={reklamIzle} 
                disabled={!captchaToken} 
                className="w-full py-3 rounded-xl bg-blue-500 text-white font-black text-sm hover:bg-blue-600 transition-all uppercase italic disabled:opacity-50"
              >
                📺 Enerji Tazele (+5)
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}