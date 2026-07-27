import React from 'react';
import { Helmet } from 'react-helmet-async';
import PropTypes from 'prop-types';

const SEOHelmet = ({
  title,
  description,
  url,
  image = 'https://www.chaiadda.co.in/og-image.jpg',
  keywords,
  schema,
  noindex = false,
  breadcrumbs = [],
  lang = 'en-IN'
}) => {
  const siteUrl = 'https://www.chaiadda.co.in';
  const canonicalUrl = url === `${siteUrl}/` ? siteUrl : url;
  const defaultKeywords = "Chai Adda, premium tea India, buy tea online India, organic tea, masala chai, loose leaf tea, tea delivery India";
  
  const finalKeywords = keywords || defaultKeywords;
  
  // Organization + OnlineStore Schema
  const organizationStoreSchema = {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    "@id": `${siteUrl}/#organization`,
    "name": "Chai Adda",
    "url": siteUrl,
    "logo": `${siteUrl}/chailogo.png`,
    "image": `${siteUrl}/og-image.jpg`,
    "description": "India's premium online chai brand. Order authentic masala chai, organic green tea, and herbal blends online. Pan-India delivery to all states and cities.",
    "email": "Namanmzn1996@gmail.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Head Office, Building 0, Floor 0, Balaji Mandir Road, Bhartiya Colony, Near Naveen Mandi Sthal",
      "addressLocality": "Muzaffarnagar",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "251001",
      "addressCountry": "IN"
    },
    "areaServed": {
      "@type": "Country",
      "name": "India"
    },
    "sameAs": [
      "https://www.instagram.com/chaiadda.co?igsh=eHFhMWM2NGM1cDZv&utm_source=qr",
      "https://www.facebook.com/share/184ioRP2Ne/?mibextid=wwXIfr"
    ],
    "priceRange": "₹",
    "servesCuisine": ["Indian Chai", "Masala Chai", "Organic Tea", "Herbal Tea", "Green Tea", "Loose Leaf Tea"]
  };

  // WebSite + SearchAction Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    "name": "Chai Adda",
    "url": siteUrl,
    "description": "Order premium organic tea online. Pan-India delivery.",
    "inLanguage": ["en-IN", "hi"],
    "publisher": { "@id": `${siteUrl}/#organization` }
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    "url": canonicalUrl,
    "name": title,
    "description": description,
    "inLanguage": lang,
    "isPartOf": { "@id": `${siteUrl}/#website` },
    "about": { "@id": `${siteUrl}/#organization` },
    "primaryImageOfPage": image
  };

  // Breadcrumb Schema
  let breadcrumbSchema = null;
  if (breadcrumbs && breadcrumbs.length > 0) {
    breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
  }

  // Extra Schemas
  const extraSchemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      {/* Dynamic Tags */}
      <html lang={lang} />
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={finalKeywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Robots Tag */}
      {noindex ? (
        <meta name="robots" content="noindex,nofollow" />
      ) : (
        <meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      )}
      {noindex ? (
         <meta name="googlebot" content="noindex,nofollow" />
      ) : (
         <meta name="googlebot" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1" />
      )}

      {/* Static National Tags */}
      <meta name="revisit-after" content="7 days" />
      <meta name="language" content="en-IN" />
      <meta name="author" content="Chai Adda" />
      <meta name="rating" content="General" />
      <meta name="geo.region" content="IN" />
      <meta name="geo.placename" content="India" />
      <meta name="geo.position" content="20.5937;78.9629" />
      <meta name="ICBM" content="20.5937, 78.9629" />
      <meta name="theme-color" content="#385040" />
      
      {/* Mobile & Web App Tags */}
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content="Chai Adda" />
      <meta name="application-name" content="Chai Adda" />
      
      {/* Links */}
      <link rel="manifest" href="/manifest.json" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      <link rel="alternate" hrefLang="en-in" href={canonicalUrl} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl} />

      {/* Open Graph Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${title} - Chai Adda`} />
      <meta property="og:site_name" content="Chai Adda" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:image:alt" content={`${title} - Chai Adda`} />
      <meta name="twitter:site" content="@chaiadda" />

      {/* JSON-LD Schemas (Only if noindex is false) */}
      {!noindex && (
        <script type="application/ld+json">
          {JSON.stringify(organizationStoreSchema)}
        </script>
      )}
      {!noindex && (
        <script type="application/ld+json">
          {JSON.stringify(websiteSchema)}
        </script>
      )}
      {!noindex && (
        <script type="application/ld+json">
          {JSON.stringify(webPageSchema)}
        </script>
      )}
      {!noindex && breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      {!noindex && extraSchemas.map((s, idx) => (
        <script key={`schema-${idx}`} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

SEOHelmet.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  image: PropTypes.string,
  keywords: PropTypes.string,
  schema: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  noindex: PropTypes.bool,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired
    })
  ),
  lang: PropTypes.string
};

export default SEOHelmet;
