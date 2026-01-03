'use client';
import React from 'react';
import Link from 'next/link';

const KATEGORILER = [
  { id: 'kedi', ad: 'Kediler', ikon: '🐱', renk: 'from-orange-400 to-amber-600' },
  { id: 'kopek', ad: 'Köpekler', ikon: '🐶', renk: 'from-blue-400 to-indigo-600' },
  { id: 'kus', ad: 'Kuşlar', ikon: '🦜', renk: 'from-green-400 to-emerald-600' },
  { id: 'egzotik', ad: 'Egzotik', ikon: '🦎', renk: 'from-purple-400 to-pink-600' },
];

export default function KategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pt-24">
      {/* ÜST BAR */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 flex justify-start">
        <Link href="/" className="bg-white/5 backdrop-blur-md border border-white/10 px-4 py-2 rounded-2xl text-[10px] font-black text-amber-500 uppercase italic active:scale-95 transition-all">
          ← Geri Dön
        </Link>
      </div>

      <div className="max-w-xl mx-auto">
        <h1 className="text-3xl font-black italic uppercase tracking-tighter mb-2">Kategoriler</h1>
        <p className="text-white/40 text-xs font-bold uppercase tracking-widest mb-8 italic">Favori türünü seç ve oylamaya başla</p>

        <div className="grid grid-cols-1 gap-4">
          {KATEGORILER.map((kat) => (
            <Link 
              key={kat.id} 
              href={`/?kat=${kat.id}`}
              className={`relative overflow-hidden group p-8 rounded-[2.5rem] bg-gradient-to-br ${kat.renk} transition-all duration-300 active:scale-95 shadow-2xl`}
            >
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{kat.ad}</h2>
                  <p className="text-white/20 text-[10px] font-bold uppercase mt-1 italic">Hemen Keşfet →</p>
                </div>
                <span className="text-5xl group-hover:scale-110 transition-transform duration-500">{kat.ikon}</span>
              </div>
              {/* Dekoratif Işık Etkisi */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 blur-[50px] -mr-16 -mt-16 rounded-full"></div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}