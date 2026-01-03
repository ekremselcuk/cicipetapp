'use client';
import React from 'react';
import Link from 'next/link';

const ANA_KATEGORILER = [
  { 
    id: 'kedi', ad: 'Kedi', renk: 'from-orange-500 to-amber-600', link: '/?kat=kedi',
    ikon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/></svg>
  },
  { 
    id: 'kopek', ad: 'Köpek', renk: 'from-blue-500 to-indigo-600', link: '/?kat=kopek',
    ikon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M11.25 16.25h1.5L12 17z"/><path d="M16 14v.5"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444a11.702 11.702 0 0 0-.493-3.309"/><path d="M8 14v.5"/><path d="M8.5 8.5c-.384 1.05-1.083 2.028-2.344 2.5-1.931.722-3.576-.297-3.656-1-.113-.994 1.177-6.53 4-7 1.923-.321 3.651.845 3.651 2.235A7.497 7.497 0 0 1 14 5.277c0-1.39 1.844-2.598 3.767-2.277 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/></svg>
  },
  { 
    id: 'kus', ad: 'Kuş', renk: 'from-emerald-400 to-teal-600', link: '/?kat=kus',
    ikon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M16 7h.01"/><path d="M3.4 18H12a8 8 0 0 0 8-8V7a4 4 0 0 0-7.28-2.3L2 20"/><path d="m20 7 2 .5-2 .5"/><path d="M10 18v3"/><path d="M14 17.75V21"/><path d="M7 18a6 6 0 0 0 3.84-10.61"/></svg>
  },
  { 
    id: 'diger', ad: 'Diğer', renk: 'from-zinc-700 to-zinc-900', link: '/kategoriler/diger',
    ikon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12"><path d="M2 16s9-15 20-4C11 23 2 8 2 8"/></svg>
  }
];

export default function KategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="fixed top-0 left-0 w-full p-4 z-50">
        <Link href="/" className="bg-white/5 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-2xl text-[10px] font-black uppercase italic text-white/50 active:scale-90 transition-all">← Geri</Link>
      </div>
      <div className="max-w-md mx-auto">
        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-12">ANA <span className="text-amber-500 block">KATEGORİ</span></h1>
        <div className="grid grid-cols-2 gap-5">
          {ANA_KATEGORILER.map((kat) => (
            <Link key={kat.id} href={kat.link} className={`relative aspect-square flex flex-col items-center justify-center rounded-[3rem] bg-gradient-to-br ${kat.renk} transition-all active:scale-95 shadow-2xl border-t border-white/20 group`}>
              <div className="mb-4 text-white group-hover:scale-110 transition-transform duration-300">{kat.ikon}</div>
              <h2 className="text-sm font-black italic uppercase tracking-widest">{kat.ad}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}