'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Kesfet() {
  const [fotolar, setFotolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    checkUser();
    kediGetir();
  }, []);

  // İnternetten kedi çek ve veritabanı formatına uydur
  const kediGetir = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=10');
      const data = await res.json();
      
      const yeniKediler = data.map((kedi: any) => ({
        id: kedi.id,
        foto_url: kedi.url,
        pet_adi: `Cici-${kedi.id.slice(0, 4)}`, // Daha tatlı bir isim formatı
        puan: Math.floor(Math.random() * 500) + 100, // 100-600 arası başlangıç puanı
        liked: false
      }));

      setFotolar(prev => [...prev, ...yeniKediler]);
    } catch (error) {
      console.error("Kedi çekme hatası:", error);
    }
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

  // Kalbe basınca oylama efekti ve puan artışı
  const begeniAt = (index: number) => {
    setFotolar(prev => {
      const yeni = [...prev];
      if (!yeni[index].liked) {
        yeni[index].puan += 1;
        yeni[index].liked = true;
      }
      return yeni;
    });
    // Not: Bu oylar şu an veritabanına gitmez (çünkü fotolar internetten anlık geliyor)
    // Eğer veritabanına kaydedilsin dersen buraya supabase.from().insert() ekleriz.
  };

  return (
    <main className="min-h-screen bg-amber-50 p-4 pb-20 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-amber-600 uppercase italic tracking-tighter">Keşfet 🌍</h1>
          <Link href="/" className="bg-white px-4 py-2 rounded-2xl shadow-md text-xs font-black border-2 border-amber-100 text-amber-600 uppercase italic">🏠 Ana Sayfa</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {fotolar.map((foto, index) => (
            <div 
              key={foto.id + index} 
              ref={fotolar.length === index + 1 ? sonElemanRef : null}
              className="bg-white p-3 rounded-[2rem] shadow-xl border-4 border-white relative group transition-all hover:scale-105"
            >
              {/* Resim Alanı */}
              <div className="relative h-48 w-full overflow-hidden rounded-3xl mb-3 shadow-inner">
                <img src={foto.foto_url} className="w-full h-full object-cover" alt="Kedi" />
                
                {/* Kalp Butonu (Üstünde!) */}
                <button 
                  onClick={() => begeniAt(index)}
                  className={`absolute bottom-3 right-3 p-3 rounded-2xl shadow-lg transition-all active:scale-90 ${foto.liked ? 'bg-red-500 text-white' : 'bg-white/90 text-red-500 hover:bg-red-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill={foto.liked ? "currentColor" : "none"} viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>

              {/* Alt Bilgi Alanı */}
              <div className="px-1">
                <div className="text-[11px] font-black text-amber-800 uppercase italic truncate mb-1">
                  {foto.pet_adi}
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-black text-amber-500 italic">{foto.puan}</span>
                  <span className="text-[10px] font-bold text-amber-300 uppercase italic">CP</span>
                </div>
              </div>

              {/* Oylandı Efekti */}
              {foto.liked && (
                <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase animate-bounce">
                  Oylandı!
                </div>
              )}
            </div>
          ))}
        </div>

        {loading && (
          <div className="flex flex-col items-center py-10 gap-4">
            <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-black text-amber-600 uppercase italic text-sm">Sonsuz Kediler Yükleniyor...</p>
          </div>
        )}
      </div>
    </main>
  );
}