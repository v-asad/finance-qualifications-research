import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, Navigate, Outlet, RouterProvider, ScrollRestoration, useLocation, useRouteError } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles.css';
import { MeProvider, useMe } from './lib/me';
import { ToastProvider } from './components/toast';
import { AppShell } from './components/AppShell';
import { Spinner } from './components/ui';
import { setUnauthorizedHandler, flushOutbox } from './lib/api';
import { initPwa } from './lib/pwa';
import Home from './pages/Home';
import Learn from './pages/Learn';
import { TopicPage, ModulePage } from './pages/Topic';
import Roadmap from './pages/Roadmap';
import Review from './pages/Review';
import Settings from './pages/Settings';
import { Login, Register } from './pages/Auth';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';

const SessionPage = lazy(() => import('./pages/Session'));
const Formulas = lazy(() => import('./pages/Formulas'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 15_000 },
  },
});

setUnauthorizedHandler(() => {
  queryClient.setQueryData(['me'], null);
});

/** Auth + onboarding gate for everything except /login and /register. */
function Gate() {
  const { me, loading } = useMe();
  const location = useLocation();
  if (loading) return <Splash />;
  if (!me) {
    const next = location.pathname + location.search;
    return <Navigate to={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} replace />;
  }
  if (!me.user.settings.onboarded && !location.pathname.startsWith('/welcome')) return <Navigate to="/welcome" replace />;
  return <Outlet />;
}

function PublicOnly() {
  const { me, loading } = useMe();
  const location = useLocation();
  if (loading) return <Splash />;
  if (me) {
    const next = new URLSearchParams(location.search).get('next');
    return <Navigate to={next && next.startsWith('/') && !next.startsWith('//') ? next : '/'} replace />;
  }
  return <Outlet />;
}

function Splash() {
  return (
    <div className="flex min-h-[100dvh] items-center justify-center">
      <img src="/icons/icon-192.png" alt="" className="h-20 w-20 animate-pop rounded-[22px] shadow-pop" />
    </div>
  );
}

function Root() {
  return (
    <>
      <ScrollRestoration getKey={(loc) => loc.pathname + loc.search.replace(/[?&]sheet=[^&]*(&arg=[^&]*)?/, '')} />
      <Outlet />
    </>
  );
}

function RouteError() {
  const err = useRouteError() as Error;
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center px-8 text-center">
      <img src="/icons/icon-192.png" alt="" className="mb-5 h-16 w-16 rounded-[18px]" />
      <h1 className="h2">Something went wrong</h1>
      <p className="mt-2 text-sm text-ink-mute dark:text-slate-400">{err?.message || 'Unexpected error'}</p>
      <button className="btn btn-primary mt-6" onClick={() => window.location.assign('/')}>Reload</button>
    </div>
  );
}

const lazyEl = (el: JSX.Element) => <Suspense fallback={<Spinner />}>{el}</Suspense>;

const router = createBrowserRouter([
  {
    element: <Root />,
    errorElement: <RouteError />,
    children: [
      {
        element: <PublicOnly />,
        children: [
          { path: '/login', element: <Login /> },
          { path: '/register', element: <Register /> },
        ],
      },
      {
        element: <Gate />,
        children: [
          { path: '/welcome/:step?', element: <Onboarding /> },
          { path: '/s/:kind/:ref?', element: lazyEl(<SessionPage />) },
          {
            element: <AppShell />,
            children: [
              { path: '/', element: <Home /> },
              { path: '/learn', element: <Learn /> },
              { path: '/learn/:topicId', element: <TopicPage /> },
              { path: '/learn/:topicId/:moduleId', element: <ModulePage /> },
              { path: '/formulas', element: lazyEl(<Formulas />) },
              { path: '/roadmap', element: <Roadmap /> },
              { path: '/review', element: <Review /> },
              { path: '/settings/:section?', element: <Settings /> },
              { path: '*', element: <NotFound /> },
            ],
          },
        ],
      },
    ],
  },
]);

initPwa();
void flushOutbox();

// A deploy replaced the hashed chunks this page expects: reload once to pick up the new build.
window.addEventListener('vite:preloadError', (e) => {
  e.preventDefault();
  if (sessionStorage.getItem('ledger.reloadedForChunk') !== '1') {
    sessionStorage.setItem('ledger.reloadedForChunk', '1');
    window.location.reload();
  }
});
window.addEventListener('load', () => setTimeout(() => sessionStorage.removeItem('ledger.reloadedForChunk'), 10000));

// Returning from the bfcache (iOS swipe-back/forward between apps): refresh stale data.
window.addEventListener('pageshow', (e) => {
  if (e.persisted) void queryClient.invalidateQueries();
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <MeProvider>
        <ToastProvider>
          <RouterProvider router={router} future={{ v7_startTransition: true }} />
        </ToastProvider>
      </MeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
