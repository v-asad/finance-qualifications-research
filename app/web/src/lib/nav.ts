import { useCallback } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

/** True when there is an in-app history entry to go back to (React Router stores idx in history.state). */
export const canGoBack = () => (window.history.state?.idx ?? 0) > 0;

/**
 * Back that works for deep links too: pops history when possible,
 * otherwise replaces with a sensible parent route (e.g. after opening a shared link or a push notification).
 */
export function useGoBack(fallback: string) {
  const navigate = useNavigate();
  return useCallback(() => {
    if (canGoBack()) navigate(-1);
    else navigate(fallback, { replace: true });
  }, [navigate, fallback]);
}

/**
 * Bottom sheets live in the URL (?sheet=name) so the browser/iOS back gesture closes them
 * instead of leaving the page, and forward re-opens them.
 */
export function useSheet(name: string) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const open = params.get('sheet') === name;
  const arg = open ? params.get('arg') : null;

  const show = useCallback((value?: string) => {
    const next = new URLSearchParams(location.search);
    next.set('sheet', name);
    if (value !== undefined) next.set('arg', value); else next.delete('arg');
    navigate({ pathname: location.pathname, search: `?${next}` }, { state: { ...(location.state as object), sheet: true } });
  }, [location, name, navigate]);

  const hide = useCallback(() => {
    if ((location.state as any)?.sheet && canGoBack()) navigate(-1);
    else {
      const next = new URLSearchParams(location.search);
      next.delete('sheet');
      next.delete('arg');
      const qs = next.toString();
      navigate({ pathname: location.pathname, search: qs ? `?${qs}` : '' }, { replace: true });
    }
  }, [location, navigate]);

  return { open, arg, show, hide };
}
