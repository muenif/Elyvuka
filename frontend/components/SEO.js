import Head from "next/head";
import { useRouter } from "next/router";

const SITE_NAME = "ELYVUKA";
const BASE_URL = "https://elyvukastore.com";

export default function SEO({
  title,
  description,
  canonicalPath,
  image,
  type = "website",
  noIndex = false,
  structuredData,
}) {
  const router = useRouter();
  const pageTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Buy Laptops in Kenya`;
  const pageDescription =
    description ||
    "Find quality laptops, gaming devices, and everyday computing essentials in Kenya with cash-on-delivery convenience.";
  const pathname = canonicalPath || router.asPath.split("?")[0] || "/";
  const canonicalUrl = `${BASE_URL}${pathname}`;
  const ogImage = image || `${BASE_URL}/og-image.svg`;

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="robots" content={noIndex ? "noindex,nofollow" : "index,follow,max-image-preview:large"} />
      <meta name="theme-color" content="#163c30" />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={pageTitle} />

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </Head>
  );
}
