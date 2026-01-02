'use client';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

export default function Kesfet() {
  const [fotolar, setFotolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const observer = useRef<IntersectionObserver | null>(null);

  // İnternetten (TheCatAPI) rastgele kediler çeken fonksiyon
  const kediGetir = async () => {
    setLoading(true);
    try {
      // Tek seferde 10 tane rastgele kedi çekiyoruz
      const res = await fetch('https://api.thecatapi.com/v1/images/search?limit=10');
      const data = await res.json();
      
      const yeniKediler = data.map((kedi: any) => ({
        id: kedi.id,
        foto_url: kedi.url,
        pet_adi: "Gizemli Misafir",
        puan: Math.floor(Math.random() * 1000) // Şimdilik rastgele puan veriyoruz
      }));

      setFotolar(prev => [...prev, ...yeniKediler]);
    } catch (error) {
      console.error("Kedi bulunamadı:", error);
    }
    setLoading(false);
  };

  // Sayfa açıldığında ilk kedileri getir
  useEffect(() => {
    kediGetir();
  }, []);

  // Sonsuz kaydırma: Listenin sonuna gelince tetikle
  const sonElemanRef = useCallback((node: any) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        kediGetir(); // Sona gelince 10 tane daha çek
      }
    });
    if (node) observer.current.observe(node);
  }, [loading]);

  return (
    <main className="min-h-screen bg-amber-50 p-4 pb-20 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-amber-600 uppercase italic">Global Keşfet 🌍</h1>
          <Link href="/" className="bg-white px-4 py-2 rounded-xl shadow-sm text-xs font-bold border-2 border-amber-100 italic">🏠 Ana Sayfa</Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotolar.map((foto, index) => (
            <div 
              key={foto.id + index} 
              ref={fotolar.length === index + 1 ? sonElemanRef : null}
              className="bg-white p-3 rounded-3xl shadow-md border-4 border-white transform transition-all hover:rotate-1"
            >
              <img src={foto.foto_url} className="w-full h-40 object-cover rounded-2xl mb-2 shadow-inner" alt="Kedi" />
              <div className="flex justify-between items-center text-[10px] font-black uppercase italic text-amber-700">
                <span>{foto.pet_adi}</span>
                <span className="bg-amber-100 p-1 rounded-md">{foto.puan} CP</span>
              </div>
            </div>
          ))}
        </div>

        {loading && (
          <div className="text-center py-10 font-black text-amber-600 animate-pulse uppercase italic">
            Dünyanın dört bir yanından kediler geliyor... 🐾
          </div>
        )}
      </div>
    </main>
  );
}