import { Toaster } from 'react-hot-toast';
import { AppRouter } from './app/AppRouter';
import { AuthProvider } from './shared/context/AuthContext';
import { BrandProvider } from './shared/context/BrandContext';
import { CartProvider } from './features/ecommerce/context/CartContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrandProvider>
        <CartProvider>
          <Toaster
            position="top-right"
            containerClassName="print:hidden"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
          <AppRouter />
        </CartProvider>
      </BrandProvider>
    </AuthProvider>
  );
}

export default App;

