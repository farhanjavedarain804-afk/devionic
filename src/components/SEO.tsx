import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  jsonLd?: object;
}

const BASE_TITLE = "Devionic (Private) Limited";
const BASE_URL = "https://devionic.com";
const DEFAULT_OG_IMAGE = "https://devionic.com/og-cover.png";

const ORG_JSON_LD = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "name": "Devionic (Private) Limited",
  "alternateName": "Devionic",
  "url": "https://devionic.com",
  "logo": "https://devionic.com/devionic-logo.png",
  "image": DEFAULT_OG_IMAGE,
  "description": "Premier IT services company delivering software development, AI automation, mobile apps, and digital transformation solutions.",
  "foundingDate": "2022",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Chowk Azam",
    "addressLocality": "Layyah",
    "addressRegion": "Punjab",
    "postalCode": "31200",
    "addressCountry": "PK"
  },
  "contactPoint": [{
    "@type": "ContactPoint",
    "telephone": "+92-317-7121841",
    "contactType": "customer service",
    "availableLanguage": ["English", "Urdu"]
  }],
  "email": "info@devionic.com",
  "telephone": "+92-317-7121841",
  "sameAs": [
    "https://www.facebook.com/devionic",
    "https://www.linkedin.com/company/devionic",
    "https://twitter.com/devionic",
    "https://www.instagram.com/devionic"
  ],
  "areaServed": "Worldwide",
  "priceRange": "$$",
  "openingHours": "Mo-Fr 09:00-18:00"
};

const setMeta = (attr: string, key: string, value: string) => {
  let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
};

const setLink = (rel: string, href: string) => {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

const injectJsonLd = (id: string, data: object) => {
  let el = document.getElementById(id) as HTMLScriptElement | null;
  if (!el) {
    el = document.createElement("script");
    el.setAttribute("type", "application/ld+json");
    el.id = id;
    document.head.appendChild(el);
  }
  el.textContent = JSON.stringify(data);
};

const SEO = ({ title, description, canonical, ogImage, jsonLd }: SEOProps) => {
  useEffect(() => {
    const fullTitle = `${title} | ${BASE_TITLE}`;
    const desc = description || "Devionic (Private) Limited provides premier software development, mobile apps, AI automation and digital transformation services globally.";
    const canonicalUrl = canonical ? (canonical.startsWith("http") ? canonical : `${BASE_URL}${canonical}`) : BASE_URL;
    const image = ogImage || DEFAULT_OG_IMAGE;

    // Title
    document.title = fullTitle;

    // Standard meta
    setMeta("name", "description", desc);
    setMeta("name", "robots", "index, follow");
    setMeta("name", "author", BASE_TITLE);

    // Canonical
    setLink("canonical", canonicalUrl);

    // Open Graph
    setMeta("property", "og:type", "website");
    setMeta("property", "og:site_name", BASE_TITLE);
    setMeta("property", "og:title", fullTitle);
    setMeta("property", "og:description", desc);
    setMeta("property", "og:url", canonicalUrl);
    setMeta("property", "og:image", image);
    setMeta("property", "og:image:width", "1200");
    setMeta("property", "og:image:height", "630");
    setMeta("property", "og:locale", "en_US");

    // Twitter Card
    setMeta("name", "twitter:card", "summary_large_image");
    setMeta("name", "twitter:site", "@devionic");
    setMeta("name", "twitter:title", fullTitle);
    setMeta("name", "twitter:description", desc);
    setMeta("name", "twitter:image", image);

    // JSON-LD: Organization (always present)
    injectJsonLd("jsonld-org", ORG_JSON_LD);

    // JSON-LD: Page-specific
    if (jsonLd) injectJsonLd("jsonld-page", jsonLd);

  }, [title, description, canonical, ogImage, jsonLd]);

  return null;
};

export default SEO;
