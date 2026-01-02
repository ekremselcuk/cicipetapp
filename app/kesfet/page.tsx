'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function Kesfet() {
  const [fotolar, setFotolar] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sayfa, setSayfa] = useState(0);
  const [dahaVarMi, setDahaVarMi] = useState(true);
  const ADET_BASINA = 12; // Her seferinde kaç tane gelsin?

  useEffect(() => {
    dahaFazlaGetir();
  }, []);

  const dahaFazlaGetir = async () => {
    if (loading || !dahaVarMi) return;
    setLoading(true);

    // Sayfalama aralığını hesapla (0-11, 12-23...)
    const baslangic = sayfa * ADET_BASINA;
    const bitis = baslangic + ADET_BASINA - 1;

    const { data, error } = await supabase
      .from('fotolar')
      .select('*')
      .order('puan', { ascending: false })
      .range(baslangic, bitis); // Veritabanından belirli aralığı çek

    if (data) {
      if (data.length < ADET_BASINA) setDahaVarMi(false); // Gelen veri azsa demek ki bitti
      setFotolar(oncekiler => [...oncekiler, ...data]); // Eskilerin üzerine ekle
      setSayfa(onceki => onceki + 1);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-amber-50 p-4 pb-20 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-black text-amber-600 uppercase italic">Keşfet 🌍</h1>
          <Link href="/" className="bg-white px-4 py-2 rounded-xl shadow-sm text-xs font-bold border-2 border-amber-100">🏠 Ana Sayfa</Link>
        </div>

        {/* Pet Izgarası (Grid) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotolar.map((foto, index) => (
            <div key={index} className="bg-white p-3 rounded-3xl shadow-md border-4 border-white transform transition-hover hover:scale-105">
              <div className="relative h-40 w-full mb-3">
                <img src={foto.foto_url} className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
              </div>
              <div className="flex justify-between items-center px-1">
                <span className="text-[10px] font-black text-amber-700 uppercase italic truncate">{foto.pet_adi}</span>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-600 px-2 py-1 rounded-lg">{foto.puan} CP</span>
              </div>
            </div>
          ))}
        </div>

        {/* Daha Fazla Yükle Butonu / Tetikleyici */}
        <div className="mt-8 flex justify-center">
          {dahaVarMi ? (
            <button 
              onClick={dahaFazlaGetir} 
              disabled={loading}
              className="px-8 py-3 bg-white border-4 border-amber-200 text-amber-600 font-black rounded-2xl uppercase italic hover:bg-amber-100 transition-all disabled:opacity-50"
            >
              {loading ? "Yükleniyor..." : "Daha Fazla Pet Göster 🐾"}
            </button>
          ) : (
            <p className="text-gray-400 font-bold italic">Tüm petleri gördün! ✨</p>
          )}
        </div>
      </div>
    </main>
  );
}