'use client';
import React from 'react';
import Link from 'next/link';

const ALT_KATEGORILER = [
  { 
    id: 'balik', ad: 'Balık', renk: 'from-cyan-500 to-blue-600',
    ikon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 17.93a9.77 9.77 0 0 1 0-11.86"/><path d="M7 10.67C7 8 5.58 5.97 2.73 5.5c-1 1.5-1 5 .23 6.5-1.24 1.5-1.24 5-.23 6.5C5.58 18.03 7 16 7 13.33"/><path d="M10.46 7.26C10.2 5.88 9.17 4.24 8 3h5.8a2 2 0 0 1 1.98 1.67l.23 1.4"/><path d="m16.01 17.93-.23 1.4A2 2 0 0 1 13.8 21H9.5a5.96 5.96 0 0 0 1.49-3.98"/></svg>
  },
  { 
    id: 'surungen', ad: 'Sürüngen', renk: 'from-lime-500 to-green-700',
    ikon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="m19 12-1.5 3"/><path d="M19.63 18.81 22 20"/><path d="M6.47 8.23a1.68 1.68 0 0 1 2.44 1.93l-.64 2.08a6.76 6.76 0 0 0 10.16 7.67l.42-.27a1 1 0 1 0-2.73-4.21l-.42.27a1.76 1.76 0 0 1-2.63-1.99l.64-2.08A6.66 6.66 0 0 0 3.94 3.9l-.7.4a1 1 0 1 0 2.55 4.34z"/></svg>
  },
  { 
    id: 'tavsan', ad: 'Tavşan', renk: 'from-pink-500 to-rose-600',
    ikon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M13 16a3 3 0 0 1 2.24 5"/><path d="M18 12h.01"/><path d="M18 21h-8a4 4 0 0 1-4-4 7 7 0 0 1 7-7h.2L9.6 6.4a1 1 0 1 1 2.8-2.8L15.8 7h.2c3.3 0 6 2.7 6 6v1a2 2 0 0 1-2 2h-1a3 3 0 0 0-3 3"/><path d="M20 8.54V4a2 2 0 1 0-4 0v3"/><path d="M7.612 12.524a3 3 0 1 0-1.6 4.3"/></svg>
  },
  { 
    id: 'hamster', ad: 'Hamster', renk: 'from-yellow-500 to-orange-600',
    ikon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M13 22H4a2 2 0 0 1 0-4h12"/><path d="M13.236 18a3 3 0 0 0-2.2-5"/><path d="M16 9h.01"/><path d="M16.82 3.94a3 3 0 1 1 3.237 4.868l1.815 2.587a1.5 1.5 0 0 1-1.5 2.1l-2.872-.453a3 3 0 0 0-3.5 3"/><path d="M17 4.988a3 3 0 1 0-5.2 2.052A7 7 0 0 0 4 14.015 4 4 0 0 0 8 18"/></svg>
  }
];

export default function DigerKategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pt-24 font-sans">
      <div className="fixed top-0 left-0 w-full p-4 z-50">
        <Link href="/kategoriler" className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl text-[10px] font-black uppercase italic text-white/50 active:scale-90 transition-all">← Geri</Link>
      </div>
      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">ÖZEL <span className="text-amber-500 block">TÜRLER</span></h1>
        <div className="grid grid-cols-2 gap-5">
          {ALT_KATEGORILER.map((kat) => (
            <Link key={kat.id} href={`/?kat=${kat.id}`} className={`relative aspect-square flex flex-col items-center justify-center rounded-[3rem] bg-gradient-to-br ${kat.renk} transition-all active:scale-95 shadow-2xl border-t border-white/20 group`}>
              <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-300">{kat.ikon}</div>
              <h2 className="text-sm font-black italic uppercase tracking-widest">{kat.ad}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}