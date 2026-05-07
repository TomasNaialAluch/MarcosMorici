import ComprarRouter from '@/components/comprar/ComprarRouter';

/**
 * Export estático: solo se genera `/comprar` (segmentos opcionales vacíos).
 * Las fichas `/comprar/[slug]` se resuelven en el cliente + rewrite en `firebase.json`.
 */
export async function generateStaticParams() {
  return [{ slug: [] }];
}

export default function ComprarPage() {
  return <ComprarRouter />;
}
