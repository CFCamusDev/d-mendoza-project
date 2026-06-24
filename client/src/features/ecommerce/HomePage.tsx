import BestSellersSection from './components/BestSellersSection';
import OnSaleSection from './components/OnSaleSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="pb-16">
        {/* Banner Placeholder */}
        <section className="w-full h-64 md:h-96 bg-gray-200 flex items-center justify-center relative overflow-hidden">
           <img src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=2070" className="absolute inset-0 w-full h-full object-cover opacity-60" alt="Banner" />
           <div className="relative z-10 text-center px-4">
             <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 bg-white/80 p-4 rounded-lg inline-block">Colección 2026</h1>
             <p className="text-xl text-gray-800 bg-white/80 px-4 py-2 rounded-lg font-medium shadow-sm">Encuentra tu estilo perfecto</p>
           </div>
        </section>

        {/* Nuevas Secciones Automáticas */}
        <BestSellersSection />
        <OnSaleSection />
        
      </main>
    </div>
  );
}
