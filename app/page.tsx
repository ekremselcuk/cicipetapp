'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Login from './login';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [puan, setPuan] = useState(0);
  const [oyHakki, setOyHakki] = useState(5);
  const [reklamIzleniyor, setReklamIzleniyor] = useState(false);
  const [fotoUrl, setFotoUrl] = useState("https://cataas.com/cat?width=400&height=400");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profil').select('toplam_puan').eq('id', session.user.id).single();
        if (data) setPuan(data.toplam_puan);
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const oyVer = async () => {
    if (oyHakki > 0 && user) {
      const yeniPuan = puan + 1;
      setPuan(yeniPuan);
      setOyHakki(oyHakki - 1);
      await supabase.from('profil').upsert({ id: user.id, toplam_puan: yeniPuan, son_oy_tarihi: new Date().toISOString() });
      setFotoUrl(`https://cataas.com/cat?width=400&height=400&time=${Date.now()}`);
    }
  };

  const reklamIzle = () => {
    setReklamIzleniyor(true);
    setTimeout(() => {
      setOyHakki(5);
      setReklamIzleniyor(false);
    }, 3000);
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 text-amber-600 font-black animate-pulse">YÜKLENİYOR...</div>;
  
  // GİRİŞ YAPILMAMIŞ EKRAN (Buradaki uppercase kaldırıldı)
  if (!user) return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 p-8 text-center">
      <h1 className="text-5xl font-black text-amber-600 mb-4 tracking-tighter normal-case">🐾 CiciPet</h1>
      <p className="text-amber-800 mb-8 font-medium">En tatlı patileri oylamaya hazır mısın?</p>
      <Login />
    </main>
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-[0_20px_50px_rgba(251,191,36,0.3)] text-center border-8 border-white w-full max-w-sm relative overflow-hidden">
        
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-50"></div>
        
        <div className="flex justify-between items-center mb-6 relative">
          <div className="bg-amber-100 px-3 py-1 rounded-full">
            <span className="text-[10px] font-black text-amber-600 tracking-widest uppercase">Ayrıl da Gel v1.0</span>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="text-[10px] font-bold text-red-400 hover:text-red-600 transition-colors uppercase tracking-wider">Çıkış Yap</button>
        </div>

        <div className="mb-2 text-gray-400 font-bold text-xs uppercase tracking-widest">Toplam CiciPuan</div>
        <div className="text-6xl mb-8 font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 drop-shadow-sm">
          {puan} <span className="text-xl text-orange-400 italic">CP</span>
        </div>

        <div className="relative group cursor-pointer active:scale-95 transition-transform duration-200">
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-full h-80 rounded-2xl overflow-hidden bg-gray-50 border-4 border-white shadow-inner flex items-center justify-center">
            {reklamIzleniyor ? (
               <div className="flex flex-col items-center gap-3">
                 <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                 <p className="text-amber-600 font-bold animate-pulse text-sm uppercase tracking-tighter">Reklam İzleniyor...</p>
               </div>
            ) : (
              <img src={fotoUrl} alt="Kedi" className="w-full h-full object-cover" />
            )}
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <div className="flex justify-between items-center px-2">
             <span className="text-xs font-bold text-gray-400 uppercase italic">Kalan Enerji</span>
             <div className="flex gap-1">
               {[...Array(5)].map((_, i) => (
                 <div key={i} className={`w-3 h-3 rounded-full ${i < oyHakki ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-gray-200'}`}></div>
               ))}
             </div>
          </div>

          <button 
            onClick={oyVer} 
            disabled={oyHakki === 0} 
            className={`w-full font-black py-5 rounded-2xl text-xl shadow-xl transition-all relative overflow-hidden ${
              oyHakki > 0 
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-orange-200 active:scale-95" 
              : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
          >
            {oyHakki > 0 ? "BUNA BAYILDIM! 🐾" : "ENERJİ BİTTİ"}
          </button>

          {oyHakki === 0 && !reklamIzleniyor && (
            <button 
              onClick={reklamIzle} 
              className="w-full py-4 rounded-2xl border-2 border-blue-100 text-blue-500 font-black text-sm hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              📺 ENERJİ TAZELE (+5)
            </button>
          )}
        </div>
      </div>
    </main>
  );
}