import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { PersistGate } from 'redux-persist/integration/react';
import 'simplebar-react/dist/simplebar.min.css';
import 'swiper/swiper-bundle.css';
import App from './App.tsx';
import { ScreenLoader } from './components/common/Loader.tsx';
import { AppWrapper } from './components/common/PageMeta.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import './index.css';
import { useAppSelector } from './redux/hooks.ts';
import { persistor, store } from './redux/store.ts';

function Root() {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppWrapperWithLoader />
        </PersistGate>
      </Provider>
    </ThemeProvider>
  );
}

function AppWrapperWithLoader() {
  const { setIsLoading } = useAppSelector((state) => state?.setIsLoading);

  return (
    <AppWrapper>
      {Boolean(setIsLoading) && <ScreenLoader />}
      <App />
      <ToastContainer />
    </AppWrapper>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
