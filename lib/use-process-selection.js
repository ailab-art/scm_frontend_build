'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// Selection (level / main object / sub-object / domain) lives in the URL
// query string instead of component state. That's what makes it survive
// navigation between /dashboard/dukan, /mela, /chetak — pick a process in
// one tab, and the same ?main=&sub=&domain= carries over if you copy the
// pattern into a link, and always survives a refresh.
export function useProcessSelection() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const level = searchParams.get('level') || 'Basic';
  const mainId = searchParams.get('main') ? Number(searchParams.get('main')) : null;
  const subId = searchParams.get('sub') || null;
  const domain = searchParams.get('domain') || 'Manufacturing';

  function update(next) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(next).forEach(([k, v]) => {
      if (v === null || v === undefined) params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  return {
    level,
    mainId,
    subId,
    domain,
    setLevel: (lvl) => update({ level: lvl, main: null, sub: null }),
    setMain: (id) => update({ main: id, sub: null }),
    setSub: (mainIdVal, subIdVal, domainVal) => update({ main: mainIdVal, sub: subIdVal, domain: domainVal }),
    setDomain: (d) => update({ domain: d }),
  };
}
