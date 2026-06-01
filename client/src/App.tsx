import { Toaster } from 'react-hot-toast';
import { AppRouter } from './app/AppRouter';
import { AuthProvider } from './shared/context/AuthContext';
import { BrandProvider } from './shared/context/BrandContext';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <BrandProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
        <AppRouter />
      </BrandProvider>
    </AuthProvider>
  );
}

export default App;

