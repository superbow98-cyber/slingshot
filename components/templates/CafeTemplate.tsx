'use client';

import { RestoranTemplate } from './RestoranTemplate';
import { type Tenant } from '@/lib/tenant';

// Cafe uses same cart-based flow as Restoran, just different defaults
// Brand color from tenant.brand_color handles the cafe espresso/crema palette
export function CafeTemplate(props: Parameters<typeof RestoranTemplate>[0]) {
  return <RestoranTemplate {...props} />;
}
