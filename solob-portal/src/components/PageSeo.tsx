import { useEffect } from 'react';

const SITE_ORIGIN = 'https://whatissolob.com';

interface PageSeoProps {
  title: string;
  description: string;
  canonical?: string;
  ogImage?: string;
}

export default function PageSeo({ title, description, canonical, ogImage }: PageSeoProps) {
  useEffect(() => {
    document.title = title;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        if (attr === 'name') el.setAttribute('name', selector.match(/name="([^"]+)"/)?.[1] || '');
        if (attr === 'property') el.setAttribute('property', selector.match(/property="([^"]+)"/)?.[1] || '');
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };

    setMeta('meta[name="description"]', 'name', description);
    setMeta('meta[property="og:title"]', 'property', title);
    setMeta('meta[property="og:description"]', 'property', description);
    setMeta('meta[name="twitter:title"]', 'name', title);
    setMeta('meta[name="twitter:description"]', 'name', description);

    if (canonical) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    if (ogImage) {
      // Social scrapers (Facebook / X / LinkedIn) require an absolute URL —
      // a relative path renders no card image. Leave already-absolute URLs untouched.
      const absoluteOgImage = ogImage.startsWith('http') ? ogImage : `${SITE_ORIGIN}${ogImage}`;
      setMeta('meta[property="og:image"]', 'property', absoluteOgImage);
      setMeta('meta[name="twitter:image"]', 'name', absoluteOgImage);
    }
  }, [title, description, canonical, ogImage]);

  return null;
}
