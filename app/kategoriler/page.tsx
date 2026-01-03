'use client';
import React from 'react';
import Link from 'next/link';
import { Cat, Dog, Bird, LayoutGrid } from 'lucide-react'; // Eğer yüklü değilse emoji yerine temiz SVG kullanalım

const ANA_KATEGORILER = [
  { id: 'kedi', ad: 'Kedi', ikon: <Cat size={48} />, renk: 'from-orange-500 to-amber-600', link: '/?kat=kedi' },
  { id: 'kopek', ad: 'Köpek', ikon: <Dog size={48} />, renk: 'from-blue-500 to-indigo-600', link: '/?kat=kopek' },
  { id: 'kus', ad: 'Kuş', ikon: <Bird size={48} />, renk: 'from-emerald-400 to-teal-600', link: '/?kat=kus' },
  { id: 'diger', ad: 'Diğer', ikon: <LayoutGrid size={48} />, renk: 'from-zinc-700 to-zinc-900', link: '/kategoriler/diger' },
];

export default function KategorilerPage() {
  return (
    <main className="min-h-screen bg-black text-white p-6 pt-24">
      <div className="fixed top-0 left-0 w-full p-4"><Link href="/" className="text-[10px] font-black text-white/40 border border-white/10 px-4 py-2 rounded-xl uppercase italic">← Geri</Link></div>
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-10">Ana <span className="text-amber-500">Kategori</span></h1>
        <div className="grid grid-cols-2 gap-4">
          {ANA_KATEGORILER.map((kat) => (
            <Link key={kat.id} href={kat.link} className={`relative aspect-square flex flex-col items-center justify-center rounded-[2.5rem] bg-gradient-to-br ${kat.renk} transition-all active:scale-95 shadow-2xl border-t border-white/20`}>
              <div className="mb-3 text-white drop-shadow-md">{kat.ikon}</div>
              <h2 className="text-sm font-black italic uppercase">{kat.ad}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}