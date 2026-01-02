'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Login from './login';
import Link from 'next/link';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [puan, setPuan] = useState(0);
  const [oyHakki, setOyHakki] = useState(0); 
  const [reklamIzleniyor, setReklamIzleniyor] = useState(false);
  const [mevcutFoto, setMevcutFoto] = useState<any>(null);
  const [yukleniyor, setYukleniyor] = useState(false);
  const [sayac, setSayac] = useState(0);
  const [liderler, setLiderler] = useState<any[]>([]);
  const [yeniPetAdi, setYeniPetAdi] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        fetchUserData(session.user.id);
        yeniFotoGetir();
        liderlikGetir();
      }
      setLoading(false);
    };
    checkUser();
  }, []);

  const fetchUserData = async (userId: string) => {
    const { data } = await supabase.from('profil').select('toplam_puan, oy_hakki').eq('id', userId).single();
    if (data) {
      setPuan(data.toplam_puan || 0);
      setOyHakki(data.oy_hakki || 0);
    }
  };

  const liderlikGetir = async () => {
    const { data } = await supabase
      .from('fotolar')
      .select('pet_adi, puan, foto_url')
      .order('puan', { ascending: false })
      .limit(5);
    if (data) setLiderler(data);
  };

  const yeniFotoGetir = async () => {
    const yeniSayac = sayac + 1;
    setSayac(yeniSayac);
    if (yeniSayac % 2 === 0) {
      const randomId = Math.floor(Math.random() * 5000);
      setMevcutFoto({ foto_url: `https://cataas.com/cat?width=400&height=400&sig=${randomId}`, id: 'default' });
    } else {
      const { data } = await supabase.from('fotolar').select('*');
      if (data && data.length > 0) {
        const rastgeleIndex = Math.floor(Math.random() * data.length);
        setMevcutFoto(data[rastgeleIndex]);
      } else {
        const randomId = Math.floor(Math.random() * 5000);
        setMevcutFoto({ foto_url: `https://cataas.com/cat?width=400&height=400&sig=${randomId}`, id: 'default' });
      }
    }
  };

  const oyVer = async () => {
    if (oyHakki > 0 && user && mevcutFoto) {
      const yeniHak = oyHakki - 1;
      const yeniPuan = puan + 1;
      
      setOyHakki(yeniHak);
      setPuan(yeniPuan);

      // DB GÜNCELLEME
      await supabase.from('profil').update({ 
        toplam_puan: yeniPuan, 
        oy_hakki: yeniHak 
      }).eq('id', user.id);

      if (mevcutFoto.id !== 'default') {
        const { data: fotoData } = await supabase.from('fotolar').select('puan').eq('id', mevcutFoto.id).single();
        await supabase.from('fotolar').update({ puan: (fotoData?.puan || 0) + 1 }).eq('id', mevcutFoto.id);
        liderlikGetir();
      }
      yeniFotoGetir();
    }
  };

  // KRİTİK NOKTA: ENERJİ TAZELERKEN DB'YE YAZIYORUZ
  const reklamIzle = () => {
    setReklamIzleniyor(true);
    setTimeout(async () => {
      const tazeHak = 5;
      if (user) {
        // DB'ye enerji gönderiyoruz ki diğer sayfalar da görsün
        await supabase.from('profil').update({ oy_hakki: tazeHak }).eq('id', user.id);
      }
      setOyHakki(tazeHak);
      setReklamIzleniyor(false);
    }, 3000);
  };

  const fotoYukle = async (e: any) => {
    const file = e.target.files[0];
    if (!file || !user || !yeniPetAdi.trim()) return;
    setYukleniyor(true);
    const fileName = `${user.id}-${Date.now()}.${file.name.split('.').pop()}`;
    const { error: uploadError } = await supabase.storage.from('pet-photos').upload(fileName, file);
    if (uploadError) {
      alert("Hata: " + uploadError.message);
      setYukleniyor(false);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);
    await supabase.from('fotolar').insert([{ user_id: user.id, foto_url: publicUrl, pet_adi: yeniPetAdi.trim() }]);
    setYukleniyor(false);
    setYeniPetAdi("");
    alert(`${yeniPetAdi} yarışmaya katıldı! 🐾`);
    liderlikGetir();
    yeniFotoGetir();
  };

  const cikisYap = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600 uppercase italic">Yükleniyor...</div>;
  if (!user) return <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 p-8 text-center font-sans"><h1 className="text-5xl font-black text-amber-600 mb-4 tracking-tighter uppercase italic">CiciPet</h1><Login /></main>;

  return (
    <main className="flex min-h-screen flex-col items-center p-4 bg-gradient-to-b from-amber-50 to-orange-100 font-sans pb-20">
      
      <div className="w-full max-w-sm flex justify-between items-center gap-2 mb-4">
        <Link href="/kesfet" className="flex-1 text-[10px] font-black text-blue-600 bg-white px-3 py-3 rounded-2xl uppercase text-center shadow-md border-2 border-blue-100 italic">Keşfet 🌍</Link>
        <Link href="/profil" className="flex-1 text-[10px] font-black text-amber-600 bg-white px-3 py-3 rounded-2xl uppercase text-center shadow-md border-2 border-amber-100 italic">Profil 👤</Link>
        <button onClick={cikisYap} className="text-[10px] font-black text-red-500 bg-white px-3 py-3 rounded-2xl uppercase shadow-md border-2 border-red-100">Çıkış</button>
      </div>

      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl text-center border-8 border-white w-full max-w-sm relative mb-8">
        <div className="flex justify-between items-center mb-1">
          <div className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Puanın</div>
          <div className="bg-orange-100 px-3 py-1 rounded-full text-orange-600 font-black text-[10px] uppercase tracking-tighter shadow-inner">⚡ Hak: {oyHakki}</div>
        </div>
        <div className="text-6xl mb-6 font-black text-amber-500">{puan} <span className="text-xl italic lowercase text-amber-300">cp</span></div>

        <div className="relative w-full h-80 rounded-3xl overflow-hidden bg-gray-50 border-4 border-white shadow-inner mb-6">
          {reklamIzleniyor ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 bg-amber-50">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-amber-600 font-bold text-sm uppercase italic">Reklam İzleniyor...</p>
            </div>
          ) : (
            <img key={mevcutFoto?.foto_url} src={mevcutFoto?.foto_url} alt="Pet" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="space-y-4">
          <button onClick={oyVer} disabled={oyHakki === 0 || reklamIzleniyor} className="w-full font-black py-4 rounded-2xl text-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50 uppercase italic tracking-tighter">
            {oyHakki > 0 ? "Buna Bayıldım! 🐾" : "Enerji Bitti"}
          </button>
          {oyHakki === 0 && !reklamIzleniyor && (
            <button onClick={reklamIzle} className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-500 font-bold text-sm bg-blue-50 hover:bg-blue-100 transition-all uppercase italic">📺 Video İzle Enerji Al (+5)</button>
          )}

          <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100 space-y-3">
            <input 
              type="text" 
              placeholder="Pati İsmi Yaz!" 
              value={yeniPetAdi}
              onChange={(e) => setYeniPetAdi(e.target.value)}
              className="w-full bg-white border-2 border-amber-200 rounded-xl px-4 py-2 text-sm font-bold text-amber-700 outline-none placeholder:text-amber-200 uppercase text-center"
            />
            <div className="relative">
              <input type="file" accept="image/*" onChange={fotoYukle} disabled={yukleniyor || !yeniPetAdi.trim()} className={`absolute inset-0 z-10 ${yeniPetAdi.trim() ? 'cursor-pointer' : 'cursor-not-allowed'}`} />
              <div className={`w-full py-3 rounded-xl border-2 border-dashed font-black text-sm flex items-center justify-center gap-2 uppercase transition-all ${yeniPetAdi.trim() ? 'border-amber-500 text-amber-600 bg-white shadow-md' : 'border-gray-200 text-gray-300 bg-gray-50'}`}>
                {yukleniyor ? "Yükleniyor..." : "📸 Foto Seç ve Katıl"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full max-w-sm bg-white rounded-[2rem] p-6 shadow-xl border-4 border-white">
        <h2 className="text-xl font-black text-amber-600 uppercase italic mb-4 flex items-center gap-2">🏆 Top 5</h2>
        <div className="space-y-3">
          {liderler.map((pet, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-amber-50 border border-amber-100">
              <div className="flex items-center gap-3">
                <span className="font-black text-amber-500 w-4">#{index + 1}</span>
                <img src={pet.foto_url} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                <span className="font-bold text-gray-700 text-sm truncate w-24 text-left uppercase">{pet.pet_adi}</span>
              </div>
              <div className="font-black text-orange-500">{pet.puan} <span className="text-[10px] text-orange-300 uppercase">cp</span></div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}