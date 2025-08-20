import { useEffect } from 'react';

export default function usePageTitle(title: string, suffix = "Bob's Garage") {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} — ${suffix}` : suffix;
    return () => { document.title = prev; };
  }, [title, suffix]);
}
