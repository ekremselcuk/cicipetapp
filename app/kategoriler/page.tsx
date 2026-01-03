'use client';
import React from 'react';
import Link from 'next/link';

const ANA_KATEGORILER = [
  { 
    id: 'kedi', ad: 'Kedi', 
    renk: 'from-orange-500 to-amber-600', link: '/?kat=kedi',
    ikon: (
      <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 5c.5 0 .5 4 5 2 0 2-2.5 10-5 10s-5-8-5-10c4.5 2 4.5-2 5-2zM9 5c-.5 0-.5 4-5 2 0 2 2.5 10 5 10s5-8 5-10C9 7 9 3 9 5z" />
        <path d="M12 14c1 0 2 .5 2 1.5S13 18 12 18s-2-1.5-2-2.5 1-1.5 2-1.5z" />
      </svg>
    )
  },
  { 
    id: 'kopek', ad: 'Köpek', 
    renk: 'from-blue-500 to-indigo-600', link: '/?kat=kopek',
    ikon: (
      <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18-5v3a2 2 0 0 0 2 2h3m-10 9a2 2 0 1 1-4 0 2 2 0 0 1 4 0z" />
        <path d="M12 14v4m-3-3h6M5 18a7 7 0 1 1 14 0" />
      </svg>
    )
  },
  { 
    id: 'kus', ad: 'Kuş', 
    renk: 'from-emerald-400 to-teal-600', link: '/?kat=kus',
    ikon: (
      <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 8s-4-1-6 2c-1.5 2.5-1 7-1 7l4-2 3 3 2-6-2-4z" />
        <circle cx="13" cy="11" r="1" />
        <path d="M9 14l-3 1-1-3" />
      </svg>
    )
  },
  { 
    id: 'diger', ad: 'Diğer', 
    renk: 'from-zinc-700 to-zinc-900', link: '/kategoriler/diger',
    ikon: (
      <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
      </svg>
    )
  },
];

export default function KategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="fixed top-0 left-0 w-full p-4 flex justify-start z-50">
        <Link href="/" className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase italic tracking-widest text-white/70 active:scale-95 transition-all">← Geri Dön</Link>
      </div>
      
      <div className="max-w-md mx-auto">
        <div className="mb-12">
          <h1 className="text-5xl font-black italic uppercase tracking-tighter leading-none">
            CİCİ<span className="text-amber-500 block">KATEGORİ</span>
          </h1>
          <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.4em] mt-3 italic">Pati dünyasını keşfet</p>
        </div>

        <div className="grid grid-cols-2 gap-5">
          {ANA_KATEGORILER.map((kat) => (
            <Link key={kat.id} href={kat.link} className={`group relative aspect-square flex flex-col items-center justify-center rounded-[3rem] bg-gradient-to-br ${kat.renk} transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-t border-white/20 overflow-hidden`}>
              {/* Arka Plan Parlama */}
              <div className="absolute top-0 left-0 w-full h-full bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-500 drop-shadow-2xl">
                {kat.ikon}
              </div>
              <h2 className="text-sm font-black italic uppercase tracking-widest">{kat.ad}</h2>
              {/* Alt Köşe Işığı */}
              <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-white/10 blur-3xl rounded-full" />
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}