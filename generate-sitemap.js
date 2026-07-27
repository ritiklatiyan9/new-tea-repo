import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://www.chaiadda.co.in';

// We map city routes as specified
const CITIES = [
  'muzaffarnagar', 'meerut', 'saharanpur', 'delhi', 'noida',
  'mumbai', 'bengaluru', 'lucknow', 'jaipur', 'kolkata'
];

const STATIC_ROUTES = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/shop', priority: '0.9', changefreq: 'daily' },
  { url: '/about', priority: '0.8', changefreq: 'monthly' },
  { url: '/contact', priority: '0.8', changefreq: 'monthly' },
  { url: '/blog', priority: '0.8', changefreq: 'weekly' },
  { url: '/sustainability', priority: '0.7', changefreq: 'monthly' },
  { url: '/courses', priority: '0.8', changefreq: 'weekly' },
  { url: '/shipping-policy', priority: '0.5', changefreq: 'monthly' },
];

CITIES.forEach(city => {
  STATIC_ROUTES.push({
    url: `/chai-${city}`,
    priority: '0.8',
    changefreq: 'weekly'
  });
});

async function fetchProducts(retries = 3) {
  try {
    const productsApiUrl = process.env.SITEMAP_PRODUCTS_API_URL || 'https://mern-tea-backend.vercel.app/api/products';
    const res = await fetch(productsApiUrl);
    if (!res.ok) {
      throw new Error(`API returned status: ${res.status}`);
    }
    
    // Check if the response is actually JSON before parsing to avoid syntax error crashes in terminal
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      throw new TypeError("Response not JSON");
    }
    
    const data = await res.json();
    const products = Array.isArray(data) ? data : (data.products || data.data || []);
    console.log(`Successfully fetched ${products.length} products from API.`);
    return products;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Error fetching products. Retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fetchProducts(retries - 1);
    }
    console.error(`Final failure fetching products (${error.message}). Falling back to static routes only.`);
    return [];
  }
}

async function generateSitemap() {
  const products = await fetchProducts();
  const dateStr = new Date().toISOString();

  // Combine static and dynamic routes
  let sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  sitemapContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Static Routes
  for (const route of STATIC_ROUTES) {
    sitemapContent += `  <url>\n`;
    sitemapContent += `    <loc>${SITE_URL}${route.url}</loc>\n`;
    sitemapContent += `    <lastmod>${dateStr}</lastmod>\n`;
    sitemapContent += `    <changefreq>${route.changefreq}</changefreq>\n`;
    sitemapContent += `    <priority>${route.priority}</priority>\n`;
    sitemapContent += `  </url>\n`;
  }

  // 2. Dynamic Routes (Products)
  for (const product of products) {
    const productLastMod = product.updatedAt ? new Date(product.updatedAt).toISOString() : dateStr;
    sitemapContent += `  <url>\n`;
    sitemapContent += `    <loc>${SITE_URL}/product/${product._id}</loc>\n`;
    sitemapContent += `    <lastmod>${productLastMod}</lastmod>\n`;
    sitemapContent += `    <changefreq>weekly</changefreq>\n`;
    sitemapContent += `    <priority>0.7</priority>\n`;
    sitemapContent += `  </url>\n`;
  }

  sitemapContent += `</urlset>`;

  // Write sitemap.xml
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }
  
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapContent);
  console.log('✅ sitemap.xml generated');

  // Generate sitemap-images.xml
  let imagesContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  imagesContent += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;
  
  // Add image sitemaps for products
  for (const product of products) {
    const images = [];
    if (Array.isArray(product.images)) {
      images.push(...product.images.map(img => img.url || img));
    } else if (product.image) {
      images.push(product.image);
    }
    
    if (images.length > 0) {
      imagesContent += `  <url>\n`;
      imagesContent += `    <loc>${SITE_URL}/product/${product._id}</loc>\n`;
      images.forEach(imgUrl => {
        // Strip any query params or HTML encoding just in case
        const safeUrl = imgUrl.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeTitle = (product.name || 'Chai Adda Product').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const safeCaption = ((product.description ? product.description.substring(0, 100) : '') || 'Premium Chai Adda tea').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        imagesContent += `    <image:image>\n`;
        imagesContent += `      <image:loc>${safeUrl}</image:loc>\n`;
        imagesContent += `      <image:title>${safeTitle}</image:title>\n`;
        imagesContent += `      <image:caption>${safeCaption}</image:caption>\n`;
        imagesContent += `    </image:image>\n`;
      });
      imagesContent += `  </url>\n`;
    }
  }
  imagesContent += `</urlset>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-images.xml'), imagesContent);
  console.log('✅ sitemap-images.xml generated');

  // Generate sitemap-index.xml
  let indexContent = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  indexContent += `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  indexContent += `  <sitemap>\n`;
  indexContent += `    <loc>${SITE_URL}/sitemap.xml</loc>\n`;
  indexContent += `    <lastmod>${dateStr}</lastmod>\n`;
  indexContent += `  </sitemap>\n`;

  indexContent += `  <sitemap>\n`;
  indexContent += `    <loc>${SITE_URL}/sitemap-images.xml</loc>\n`;
  indexContent += `    <lastmod>${dateStr}</lastmod>\n`;
  indexContent += `  </sitemap>\n`;

  indexContent += `</sitemapindex>`;
  fs.writeFileSync(path.join(publicDir, 'sitemap-index.xml'), indexContent);
  console.log('✅ sitemap-index.xml generated');
}

generateSitemap();
