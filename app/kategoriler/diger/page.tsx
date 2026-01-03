'use client';
import React from 'react';
import Link from 'next/link';
import { Fish, Zap, Rabbit, MousePointer2 } from 'lucide-react';

const ALT_KATEGORILER = [
  { id: 'balik', ad: 'Balık', ikon: <Fish size={48} />, renk: 'from-cyan-500 to-blue-600' },
  { id: 'surungen', ad: 'Sürüngen', ikon: <Zap size={48} />, renk: 'from-lime-500 to-green-700' }, // Zap sürüngen çevikliği için
  { id: 'tavsan', ad: 'Tavşan', ikon: <Rabbit size={48} />, renk: 'from-pink-500 to-rose-600' },
  { id: 'hamster', ad: 'Hamster', ikon: <MousePointer2 size={48} />, renk: 'from-yellow-500 to-orange-600' },
];

export default function DigerKategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="fixed top-0 left-0 w-full p-4"><Link href="/kategoriler" className="text-[10px] font-black text-white/40 border border-white/10 px-4 py-2 rounded-xl uppercase italic">← Geri</Link></div>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">Özel <span className="text-amber-500">Türler</span></h1>
        <div className="grid grid-cols-2 gap-4">
          {ALT_KATEGORILER.map((kat) => (
            <Link key={kat.id} href={`/?kat=${kat.id}`} className={`relative aspect-square flex flex-col items-center justify-center rounded-[2.5rem] bg-gradient-to-br ${kat.renk} transition-all active:scale-95 shadow-2xl border-t border-white/20`}>
              <div className="mb-3 text-white">{kat.ikon}</div>
              <h2 className="text-sm font-black italic uppercase">{kat.ad}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}