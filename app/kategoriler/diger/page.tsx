'use client';
import React from 'react';
import Link from 'next/link';

const IKONLAR = {
  balik: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 10c.5 0 1 .5 1 1s-.5 1-1 1"/><path d="M2 12c0 5 5 8 10 8 2.5 0 5-1 7-3l3 3V4l-3 3c-2-2-4.5-3-7-3-5 0-10 3-10 8Z"/></svg>,
  surungen: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 2.5h3L12 7h3l-4 5h3l-2 3h2l-5 7"/><path d="M18 10h.01"/></svg>,
  tavsan: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-1.923.321-4.5 3-4.5 3s1.5 9 1.5 12c.42 2.3 1.5 3 3 3 3 0 4.5-2 4.5-2"/><path d="M14 5.172C14 3.782 15.577 2.679 17.5 3c1.923.321 4.5 3 4.5 3s-1.5 9-1.5 12c-.42 2.3-1.5 3-3 3-3 0-4.5-2-4.5-2"/><path d="M12 12v.01"/></svg>,
  hamster: <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h.01"/><path d="M16 12h.01"/><path d="M12 15s-1-1-2-1"/></svg>
};

const ALT_KATEGORILER = [
  { id: 'balik', ad: 'Balık', ikon: IKONLAR.balik, renk: 'from-cyan-500 to-blue-600' },
  { id: 'surungen', ad: 'Sürüngen', ikon: IKONLAR.surungen, renk: 'from-lime-500 to-green-700' },
  { id: 'tavsan', ad: 'Tavşan', ikon: IKONLAR.tavsan, renk: 'from-pink-500 to-rose-600' },
  { id: 'hamster', ad: 'Hamster', ikon: IKONLAR.hamster, renk: 'from-yellow-500 to-orange-600' },
];

export default function DigerKategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="fixed top-0 left-0 w-full p-4">
        <Link href="/kategoriler" className="bg-white/5 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase italic text-white/50">← GERİ</Link>
      </div>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">ÖZEL <span className="text-amber-500">TÜRLER</span></h1>
        <div className="grid grid-cols-2 gap-4">
          {ALT_KATEGORILER.map((kat) => (
            <Link key={kat.id} href={`/?kat=${kat.id}`} className={`relative aspect-square flex flex-col items-center justify-center rounded-[2.5rem] bg-gradient-to-br ${kat.renk} transition-all active:scale-95 border-t border-white/20 shadow-2xl`}>
              <div className="mb-3 text-white">{kat.ikon}</div>
              <h2 className="text-sm font-black italic uppercase">{kat.ad}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}