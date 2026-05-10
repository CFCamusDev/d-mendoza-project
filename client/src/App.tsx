import { Toaster } from 'react-hot-toast';
import { AppRouter } from './app/AppRouter';
import './index.css';

function App() {
  return (
    <>
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
    </>
  );
}

export default App;

