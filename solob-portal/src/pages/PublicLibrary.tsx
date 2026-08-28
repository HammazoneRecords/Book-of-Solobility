import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { publicVolumes } from '../data/volumes';

export default function PublicLibrary() {
  return <main className="min-h-screen bg-[#050505] text-gray-200 px-6 py-16 sm:px-10 lg:px-16"><section className="mx-auto max-w-5xl">
    <p className="text-xs uppercase tracking-[0.45em] text-[#00d0ff]">The Book of Solobility</p>
    <h1 className="mt-5 text-4xl font-serif text-white sm:text-6xl">Read the volumes</h1>
    <p className="mt-5 max-w-2xl text-lg leading-relaxed text-gray-400">Choose a volume and begin reading immediately. Volume 0 is open to all readers.</p>
    <div className="mt-12 grid gap-5 md:grid-cols-2">{publicVolumes.map((volume) => <article key={volume.id} className="border border-white/10 bg-white/[0.03] p-7 transition-colors hover:border-[#00d0ff]/60">
      <div className="flex items-start justify-between gap-4"><BookOpen className="h-7 w-7 text-[#00d0ff]" aria-hidden="true" /><span className="text-xs uppercase tracking-[0.25em] text-gray-500">Volume {volume.number}</span></div>
      <h2 className="mt-10 text-2xl font-serif text-white">{volume.title}</h2><p className="mt-3 min-h-14 leading-relaxed text-gray-400">{volume.description}</p>
      <Link to={`/read/${volume.id}`} className="mt-8 inline-flex items-center gap-2 border border-[#00d0ff]/50 px-4 py-3 text-sm font-medium text-[#00d0ff] transition-colors hover:bg-[#00d0ff] hover:text-black">Read now <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
    </article>)}</div>
  </section></main>;
}
