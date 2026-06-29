import HeroBanner from './components/HeroBanner';
import CategoryBar from './components/CategoryBar';
import BestSellersSection from './components/BestSellersSection';
import OnSaleSection from './components/OnSaleSection';

import { CartDrawer } from './components/CartDrawer';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main className="pb-16">
        {/* Dynamic Hero Banner */}
        <HeroBanner />

        {/* Dynamic Category Navigation Bar */}
        <CategoryBar />

        {/* Product Sections */}
        <div className="space-y-6">
          <BestSellersSection />
          <OnSaleSection />
        </div>
      </main>

      <CartDrawer />
    </div>
  );
}
