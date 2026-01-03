'use client';
import React from 'react';
import Link from 'next/link';

// Elegant SVG İkon Seti
const IKONLAR = {
  kedi: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.27.88 2.67.88 4.14 0 4.14-3.36 7.5-7.5 7.5a7.48 7.48 0 0 1-5.38-2.26c-1.18 1.4-3.04 2.26-5.12 2.26C2.36 21.4 0 18.05 0 14c0-1.47.31-2.87.88-4.14 0 0-1.82-6.42-.42-7 1.39-.58 4.64.26 6.42 2.26.65-.17 1.33-.26 2-.26Z"/><path d="M8 14h.01M16 14h.01"/><path d="M12 17s-1-1-2-1"/></svg>,
  kopek: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-1.923.321-4.5 3-4.5 3s1.5 9 1.5 12c0 3 2.5 3 2.5 3s3.5-1.5 3.5-4"/><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c1.923.321 4.5 3 4.5 3s-1.5 9-1.5 12c0 3-2.5 3-2.5 3s-3.5-1.5-3.5-4"/><path d="M12 14c1.105 0 2 .895 2 2s-.895 2-2 2-2-.895-2-2 .895-2 2-2Z"/></svg>,
  kus: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z"/><path d="M12 11v10"/><path d="M9 21h6"/><path d="m16 11 3.3 3.3c.4.4.4 1 0 1.4l-3.6 3.6"/><path d="m8 11-3.3 3.3c-.4.4-.4 1 0 1.4l3.6 3.6"/></svg>,
  diger: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
};

const ANA_KATEGORILER = [
  { id: 'kedi', ad: 'Kedi', ikon: IKONLAR.kedi, renk: 'from-orange-500 to-amber-600', link: '/?kat=kedi' },
  { id: 'kopek', ad: 'Köpek', ikon: IKONLAR.kopek, renk: 'from-blue-500 to-indigo-600', link: '/?kat=kopek' },
  { id: 'kus', ad: 'Kuş', ikon: IKONLAR.kus, renk: 'from-emerald-400 to-teal-600', link: '/?kat=kus' },
  { id: 'diger', ad: 'Diğer', ikon: IKONLAR.diger, renk: 'from-zinc-700 to-zinc-900', link: '/kategoriler/diger' },
];

export default function KategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pt-24 font-sans">
      <div className="fixed top-0 left-0 w-full p-4">
        <Link href="/" className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic text-white/50">← GERİ</Link>
      </div>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">ANA <span className="text-amber-500">KATEGORİ</span></h1>
        <div className="grid grid-cols-2 gap-4">
          {ANA_KATEGORILER.map((kat) => (
            <Link key={kat.id} href={kat.link} className={`relative aspect-square flex flex-col items-center justify-center rounded-[2.5rem] bg-gradient-to-br ${kat.renk} transition-all active:scale-95 border-t border-white/20 shadow-2xl`}>
              <div className="mb-3 text-white">{kat.ikon}</div>
              <h2 className="text-sm font-black italic uppercase">{kat.ad}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}