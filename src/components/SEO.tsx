import { useEffect } from "react";

interface SEOProps {
  title: string;
  description?: string;
  canonical?: string;
}

/**
 * SEO Component
 * Dynamically updates document title and meta tags for better search engine optimization.
 */
const SEO = ({ title, description, canonical }: SEOProps) => {
  useEffect(() => {
    // 1. Update Document Title
    const baseTitle = "Devionic (Private) Limited";
    const fullTitle = `${title} | ${baseTitle}`;
    document.title = fullTitle;

    // 2. Update Meta Description
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        document.head.appendChild(metaDescription);
      }
      metaDescription.setAttribute('content', description);
    }

    // 3. Update Canonical Tag
    if (canonical) {
      let linkCanonical = document.querySelector('link[rel="canonical"]');
      if (!linkCanonical) {
        linkCanonical = document.createElement('link');
        linkCanonical.setAttribute('rel', 'canonical');
        document.head.appendChild(linkCanonical);
      }
      linkCanonical.setAttribute('href', canonical.startsWith('http') ? canonical : `https://devionic.com${canonical}`);
    }

    // 4. Update OG:Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', fullTitle);

  }, [title, description, canonical]);

  return null; // This component doesn't render any visible UI
};

export default SEO;
