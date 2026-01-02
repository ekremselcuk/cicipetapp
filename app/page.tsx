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
  const [mevcutFoto, setMevcutFoto] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sayac, setSayac] = useState(0); // Kaçıncı oylamadayız takip etmek için

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
        yeniFotoGetir();
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data } = await supabase.from('profil').select('toplam_puan').eq('id', userId).single();
    if (data) setPuan(data.toplam_puan);
  };

  const yeniFotoGetir = async () => {
    const yeniSayac = sayac + 1;
    setSayac(yeniSayac);

    // Eğer sayaç çift sayıysa (2, 4, 6...) mutlaka internetten getir
    // Eğer tek sayıysa veritabanına bak
    if (yeniSayac % 2 === 0) {
      const randomId = Math.floor(Math.random() * 5000);
      setMevcutFoto({ 
        foto_url: `https://cataas.com/cat?width=400&height=400&sig=${randomId}`, 
        id: 'default' 
      });
    } else {
      const { data } = await supabase.from('fotolar').select('*');
      if (data && data.length > 0) {
        const rastgeleIndex = Math.floor(Math.random() * data.length);
        setMevcutFoto(data[rastgeleIndex]);
      } else {
        const randomId = Math.floor(Math.random() * 5000);
        setMevcutFoto({ 
          foto_url: `https://cataas.com/cat?width=400&height=400&sig=${randomId}`, 
          id: 'default' 
        });
      }
    }
  };

  const oyVer = async () => {
    if (oyHakki > 0 && user && mevcutFoto) {
      const yeniPuan = puan + 1;
      setPuan(yeniPuan);
      setOyHakki(oyHakki - 1);

      await supabase.from('profil').upsert({ id: user.id, toplam_puan: yeniPuan });

      if (mevcutFoto.id !== 'default') {
        const { data: fotoData } = await supabase.from('fotolar').select('puan').eq('id', mevcutFoto.id).single();
        await supabase.from('fotolar').update({ puan: (fotoData?.puan || 0) + 1 }).eq('id', mevcutFoto.id);
      }

      yeniFotoGetir();
    }
  };

  const fotoYukle = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setYukleniyor(true);
    const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;

    const { error: uploadError } = await supabase.storage.from('pet-photos').upload(fileName, file);

    if (uploadError) {
      alert("Hata: " + uploadError.message);
      setYukleniyor(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);

    await supabase.from('fotolar').insert([{ user_id: user.id, foto_url: publicUrl, pet_adi: "Cici Pet" }]);

    setYukleniyor(false);
    alert("Patili dostun başarıyla yüklendi! 🐾");
    yeniFotoGetir();
  };

  const reklamIzle = () => {
    setReklamIzleniyor(true);
    setTimeout(() => {
      setOyHakki(5);
      setReklamIzleniyor(false);
    }, 3000);
  };

  const cikisYap = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase">Hazırlanıyor...</div>;
  if (!user) return <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 p-8 text-center"><h1 className="text-5xl font-black text-amber-600 mb-4 tracking-tighter uppercase italic">CiciPet</h1><Login /></main>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl text-center border-8 border-white w-full max-w-sm relative overflow-hidden">
        
        <div className="flex justify-between items-center mb-6">
          <div className="bg-amber-100 px-3 py-1 rounded-full"><span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">CiciPet v1.1</span></div>
          <button onClick={cikisYap} className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg uppercase">Çıkış</button>
        </div>

        <div className="mb-1 text-gray-400 font-bold text-xs uppercase tracking-widest">Puanın</div>
        <div className="text-6xl mb-6 font-black text-amber-500">{puan} <span className="text-xl italic lowercase">cp</span></div>

        <div className="relative w-full h-80 rounded-3xl overflow-hidden bg-gray-50 border-4 border-white shadow-inner mb-6">
          {reklamIzleniyor ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 bg-amber-50">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-amber-600 font-bold text-sm uppercase">Enerji Doluyor...</p>
            </div>
          ) : (
            <img key={mevcutFoto?.foto_url} src={mevcutFoto?.foto_url} alt="Pet" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="space-y-4">
          <button onClick={oyVer} disabled={oyHakki === 0 || reklamIzleniyor} className="w-full font-black py-4 rounded-2xl text-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50 uppercase">
            {oyHakki > 0 ? "Bayıldım! 🐾" : "Enerji Bitti"}
          </button>

          {oyHakki === 0 && !reklamIzleniyor && (
            <button onClick={reklamIzle} className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-500 font-bold text-sm bg-blue-50 hover:bg-blue-100 transition-all uppercase">
              📺 Enerji Tazele (+5)
            </button>
          )}

          <div className="relative group">
            <input type="file" accept="image/*" onChange={fotoYukle} disabled={yukleniyor} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            <div className="w-full py-4 rounded-2xl border-2 border-dashed border-amber-300 text-amber-600 font-black text-sm bg-amber-50 flex items-center justify-center gap-2 uppercase">
              {yukleniyor ? "Yükleniyor..." : "📸 Pati Yükle"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}