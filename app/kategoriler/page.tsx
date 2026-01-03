'use client';
import React from 'react';
import Link from 'next/link';

const KATEGORILER = [
  { id: 'kedi', ad: 'Kedi', ikon: '🐱', renk: 'from-orange-500 to-amber-600' },
  { id: 'kopek', ad: 'Köpek', ikon: '🐶', renk: 'from-blue-500 to-indigo-600' },
  { id: 'kus', ad: 'Kuş', ikon: '🦜', renk: 'from-emerald-400 to-teal-600' },
  { id: 'diger', ad: 'Diğer', ikon: '🐾', renk: 'from-purple-500 to-pink-600' },
];

export default function KategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-4 pt-20">
      {/* GERİ DÖN BUTONU */}
      <div className="fixed top-0 left-0 w-full z-50 p-4 flex justify-start">
        <Link href="/" className="bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl text-[11px] font-black text-amber-500 uppercase italic active:scale-90 transition-all shadow-xl">
          ← GERİ
        </Link>
      </div>

      <div className="max-w-md mx-auto">
        <div className="mb-10 pl-2">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            FAVORİ <span className="text-amber-500 text-2xl block mt-1">SEÇİMİNİ YAP</span>
          </h1>
        </div>

        {/* 2x2 IZGARA YAPISI */}
        <div className="grid grid-cols-2 gap-4">
          {KATEGORILER.map((kat) => (
            <Link 
              key={kat.id} 
              href={`/?kat=${kat.id}`}
              className={`relative overflow-hidden aspect-square flex flex-col items-center justify-center rounded-[3rem] bg-gradient-to-br ${kat.renk} transition-all duration-300 active:scale-95 shadow-[0_20px_40px_rgba(0,0,0,0.4)] group border-t border-white/30`}
            >
              <span className="text-6xl mb-3 group-hover:scale-110 transition-transform duration-500 drop-shadow-lg">
                {kat.ikon}
              </span>
              <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">
                {kat.ad}
              </h2>
              
              {/* Parlama Efekti */}
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 blur-3xl rounded-full"></div>
            </Link>
          ))}
        </div>

        <div className="mt-12 p-6 rounded-[2.5rem] bg-white/5 border border-white/10 text-center">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] italic">
            Hangi patiye puan vermek istiyorsan onu seç ve yarışmaya başla!
          </p>
        </div>
      </div>
    </main>
  );
}