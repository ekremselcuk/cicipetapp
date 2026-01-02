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
    // Önce bizim veritabanına bak
    const { data, error } = await supabase.from('fotolar').select('*');
    
    if (data && data.length > 0) {
      // Eğer yüklenmiş foto varsa içinden rastgele seç
      const rastgeleIndex = Math.floor(Math.random() * data.length);
      setMevcutFoto(data[rastgeleIndex]);
    } else {
      // Foto yoksa rastgele internet fotosu getir
      const randomId = Math.floor(Math.random() * 1000);
      setMevcutFoto({ 
        foto_url: `https://cataas.com/cat?width=400&height=400&sig=${randomId}`, 
        id: 'default' 
      });
    }
  };

  const oyVer = async () => {
    if (oyHakki > 0 && user && mevcutFoto) {
      const yeniPuan = puan + 1;
      setPuan(yeniPuan);
      setOyHakki(oyHakki - 1);

      // Oy verenin puanını güncelle
      await supabase.from('profil').upsert({ id: user.id, toplam_puan: yeniPuan });

      // Eğer yüklenmiş bir fotoysa onun puanını artır
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

    // 1. Storage'a yükle
    const { error: uploadError } = await supabase.storage.from('pet-photos').upload(fileName, file);

    if (uploadError) {
      alert("Hata: " + uploadError.message);
      setYukleniyor(false);
      return;
    }

    // 2. Linki al
    const { data: { publicUrl } } = supabase.storage.from('pet-photos').getPublicUrl(fileName);

    // 3. Veritabanına yaz
    await supabase.from('fotolar').insert([{ user_id: user.id, foto_url: publicUrl, pet_adi: "Cici Pet" }]);

    setYukleniyor(false);
    alert("Patili dostun başarıyla yüklendi! Artık oylanabilir. 🐾");
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

  if (loading) return <div className="flex min-h-screen items-center justify-center bg-amber-50 font-black text-amber-600">YÜKLENİYOR...</div>;
  if (!user) return <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-amber-100 to-orange-200 p-8 text-center"><h1 className="text-5xl font-black text-amber-600 mb-4 tracking-tighter">🐾 CiciPet</h1><Login /></main>;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-amber-50 to-orange-100">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-2xl text-center border-8 border-white w-full max-w-sm relative overflow-hidden">
        
        <div className="flex justify-between items-center mb-6">
          <div className="bg-amber-100 px-3 py-1 rounded-full"><span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">CiciPet v1.0</span></div>
          <button onClick={cikisYap} className="text-[10px] font-bold text-red-500 bg-red-50 px-3 py-1 rounded-lg">ÇIKIŞ</button>
        </div>

        <div className="mb-1 text-gray-400 font-bold text-xs uppercase tracking-widest">Senin Puanın</div>
        <div className="text-6xl mb-6 font-black text-amber-500">{puan} <span className="text-xl italic">CP</span></div>

        <div className="relative w-full h-80 rounded-3xl overflow-hidden bg-gray-50 border-4 border-white shadow-inner mb-6">
          {reklamIzleniyor ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 bg-amber-50">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-amber-600 font-bold text-sm">ENERJİ DOLUYOR...</p>
            </div>
          ) : (
            <img src={mevcutFoto?.foto_url} alt="Pet" className="w-full h-full object-cover" />
          )}
        </div>

        <div className="space-y-4">
          <button onClick={oyVer} disabled={oyHakki === 0 || reklamIzleniyor} className="w-full font-black py-4 rounded-2xl text-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50">
            {oyHakki > 0 ? "BUNA BAYILDIM! 🐾" : "ENERJİ BİTTİ"}
          </button>

          {oyHakki === 0 && !reklamIzleniyor && (
            <button onClick={reklamIzle} className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-500 font-bold text-sm bg-blue-50 hover:bg-blue-100 transition-all">
              📺 ENERJİ TAZELE (+5)
            </button>
          )}

          <div className="relative group">
            <input type="file" accept="image/*" onChange={fotoYukle} disabled={yukleniyor} className="absolute inset-0 opacity-0 cursor-pointer z-10" title="" />
            <div className="w-full py-4 rounded-2xl border-2 border-dashed border-amber-300 text-amber-600 font-black text-sm bg-amber-50 flex items-center justify-center gap-2">
              {yukleniyor ? "PATİ YÜKLENİYOR..." : "📸 KENDİ PATİNİ YÜKLE"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}