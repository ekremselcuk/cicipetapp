'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Kesfet() {
  const [fotolar, setFotolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [oyHakki, setOyHakki] = useState(0);
  const [toplamPuan, setToplamPuan] = useState(0);
  const [user, setUser] = useState<any>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const baslat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data } = await supabase.from('profil').select('oy_hakki, toplam_puan').eq('id', session.user.id).single();
        if (data) {
          setOyHakki(data.oy_hakki || 0);
          setToplamPuan(data.toplam_puan || 0);
        }
      }
    };
    baslat();
    kediGetir();
  }, []);

  const kediGetir = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=12');
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

  const begeniAt = async (index: number) => {
    const foto = fotolar[index];
    if (oyHakki <= 0 || foto.liked || !user) return;

    // 1. State Güncelle (Hız için hemen göster)
    const yeniHak = oyHakki - 1;
    const yeniPuan = toplamPuan + 1;
    setOyHakki(yeniHak);
    setToplamPuan(yeniPuan);
    setFotolar(prev => {
      const kopya = [...prev];
      kopya[index].liked = true;
      return kopya;
    });

    // 2. Veritabanını Güncelle (Sadece kullanıcının puanını ve enerjisini)
    await supabase.from('profil').update({ 
      oy_hakki: yeniHak, 
      toplam_puan: yeniPuan 
    }).eq('id', user.id);
  };

  return (
    <main className="min-h-screen bg-amber-50 p-4 pb-20 font-sans">
      <div className="max-w-4xl mx-auto">
        {/* Üst Bilgi Paneli */}
        <div className="bg-white p-6 rounded-[2rem] shadow-xl mb-8 border-4 border-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-amber-600 uppercase italic leading-none">Keşfet</h1>
            <div className="flex gap-3 mt-1">
              <span className="text-[10px] font-bold text-orange-400 uppercase italic">⚡ Enerji: {oyHakki}</span>
              <span className="text-[10px] font-bold text-amber-500 uppercase italic">🏆 Puanın: {toplamPuan}</span>
            </div>
          </div>
          <Link href="/" className="bg-amber-500 text-white px-6 py-2 rounded-2xl shadow-lg text-xs font-black uppercase italic active:scale-95">Geri Dön</Link>
        </div>

        {/* Grid Akışı */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotolar.map((foto, index) => (
            <div 
              key={foto.id + index} 
              ref={fotolar.length === index + 1 ? sonElemanRef : null}
              className="relative aspect-square rounded-[2.5rem] overflow-hidden shadow-lg border-4 border-white group bg-gray-200"
            >
              <img src={foto.foto_url} className="w-full h-full object-cover" loading="lazy" />
              
              {/* Oylama Katmanı */}
              <div 
                onClick={() => begeniAt(index)}
                className={`absolute inset-0 flex items-center justify-center transition-all cursor-pointer ${foto.liked ? 'bg-red-500/20' : 'bg-black/0 hover:bg-black/10'}`}
              >
                <div className={`transition-all duration-300 ${foto.liked ? 'scale-150 opacity-100' : 'scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100'}`}>
                   <span className="text-4xl text-white drop-shadow-lg">❤️</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {loading && <div className="text-center p-10 font-black text-amber-600 animate-pulse italic">Yeni Kediler Yükleniyor...</div>}
      </div>
    </main>
  );
}