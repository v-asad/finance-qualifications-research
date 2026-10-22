import type { PlanItem } from './types';

/** URL for starting/resuming a plan item. */
export function itemRoute(item: Pick<PlanItem, 'kind' | 'ref'>) {
  const ref = encodeURIComponent(item.ref);
  switch (item.kind) {
    case 'lesson': return `/s/lesson/${ref}`;
    case 'testout': return `/s/testout/${ref}`;
    case 'checkpoint': return `/s/checkpoint/${ref}`;
    case 'mock': return `/s/mock/${ref}`;
    case 'period':
    case 'review': return `/s/review/${ref}`;
    case 'drill':
    case 'sprint': return `/s/practice/${ref}`;
    default: return '/';
  }
}

export const sessionRoute = (kind: string, ref?: string | null) => `/s/${kind}${ref ? `/${encodeURIComponent(ref)}` : ''}`;
