'use client';

import { type Tenant } from '@/lib/tenant';
import { RestoranTemplate } from './RestoranTemplate';
import { CafeTemplate } from './CafeTemplate';
import { HartanahTemplate } from './HartanahTemplate';
import { GenericNicheTemplate } from './GenericNicheTemplate';

type Item = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  emoji: string | null;
  photo_url: string | null;
  category: string | null;
  metadata: Record<string, any>;
};

type Category = {
  id: string;
  slug: string;
  name: string;
  emoji: string | null;
};

interface TenantRendererProps {
  tenant: Tenant;
  items: Item[];
  categories: Category[];
}

export function TenantRenderer({ tenant, items, categories }: TenantRendererProps) {
  // Route to the right template component based on niche
  switch (tenant.niche) {
    case 'restoran':
      return <RestoranTemplate tenant={tenant} items={items} categories={categories} />;
    case 'cafe':
      return <CafeTemplate tenant={tenant} items={items} categories={categories} />;
    case 'hartanah':
      return <HartanahTemplate tenant={tenant} items={items} categories={categories} />;
    // For other niches, use generic template that adapts via niche prop
    case 'klinik':
    case 'dental':
    case 'aesthetic':
    case 'auto':
    case 'pasarmalam':
    case 'event':
    case 'catering':
    case 'bengkel':
    case 'dfy':
      return <GenericNicheTemplate tenant={tenant} items={items} categories={categories} />;
    default:
      return <GenericNicheTemplate tenant={tenant} items={items} categories={categories} />;
  }
}
