import { getProducts } from "../services/productService";

const SITE_URL = "https://elyvukastore.com";

export async function getServerSideProps({ res }) {
  try {
    const productsRes = await getProducts({ limit: 250, page: 1 });
    const products = Array.isArray(productsRes?.data) ? productsRes.data : [];

    const urls = [
      "",
      "/listing",
      "/checkout",
      "/track",
      ...products.map((product) => `/product/${product.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls
    .filter(Boolean)
    .map(
      (path) => `  <url><loc>${SITE_URL}${path}</loc></url>`
    )
    .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.write(xml);
    res.end();
    return { props: {} };
  } catch (error) {
    const fallbackUrls = ["", "/listing", "/checkout", "/track"];
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${fallbackUrls
    .filter(Boolean)
    .map(
      (path) => `  <url><loc>${SITE_URL}${path}</loc></url>`
    )
    .join("\n")}
</urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.write(xml);
    res.end();
    return { props: {} };
  }
}

export default function Sitemap() {
  return null;
}
