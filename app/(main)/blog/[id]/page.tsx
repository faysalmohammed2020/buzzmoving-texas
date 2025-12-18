import type { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";

type BlogApi = {
  id: number;
  post_title: string;
  excerpt?: string;
  post_content?: string;
  imageUrl?: string;
  post_status?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  tags?: string[] | string;
};

function stripHtml(html: string): string {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function toAbs(siteUrl: string, maybe?: string) {
  if (!maybe) return undefined;
  if (maybe.startsWith("http://") || maybe.startsWith("https://")) return maybe;
  return `${siteUrl}${maybe.startsWith("/") ? "" : "/"}${maybe}`;
}

async function getPost(id: string): Promise<BlogApi | null> {
  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "https://movingquotetexas.com";

  const res = await fetch(`${siteUrl}/api/blogpost?id=${id}`, {
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json();
}

// ✅ Next.js new behavior: params can be async
type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "https://movingquotetexas.com";

  const post = await getPost(id);

  const title = post?.post_title
    ? `${post.post_title} | Moving Quote Texas Blog`
    : "Blog | Moving Quote Texas Blog";

  const description =
    post?.excerpt ||
    stripHtml(post?.post_content || "").slice(0, 160) ||
    "Read this article on Moving Quote Texas Blog.";

  const canonical = post ? `${siteUrl}/blog/${post.id}` : `${siteUrl}/blog/${id}`;

  const ogImage = post?.imageUrl ? toAbs(siteUrl, post.imageUrl) : undefined;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "Moving Quote Texas Blog",
      type: "article",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;

  const siteUrl =
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") ||
    "https://movingquotetexas.com";

  const post = await getPost(id);

  // fallback (not found)
  if (!post) return <BlogPostClient />;

  const canonical = `${siteUrl}/blog/${post.id}`;
  const image = toAbs(siteUrl, post.imageUrl) || `${siteUrl}/image/mini-logo.png`;

  const description =
    post.excerpt ||
    stripHtml(post.post_content || "").slice(0, 160) ||
    "Read this article on Moving Quote Texas Blog.";

  const datePublished = post.createdAt
    ? new Date(post.createdAt).toISOString()
    : new Date().toISOString();

  const dateModified = post.updatedAt
    ? new Date(post.updatedAt).toISOString()
    : datePublished;

  const keywords =
    Array.isArray(post.tags)
      ? post.tags.join(", ")
      : typeof post.tags === "string"
      ? post.tags
      : undefined;

  // ✅ BlogPosting Schema JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonical,
    },
    url: canonical,
    headline: post.post_title,
    description,
    image: [image],
    datePublished,
    dateModified,
    author: {
      "@type": "Organization",
      name: "Moving Quote Texas",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "Moving Quote Texas",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/image/mini-logo.png`,
      },
    },
    ...(post.category ? { articleSection: post.category } : {}),
    ...(keywords ? { keywords } : {}),
    inLanguage: "en",
    isAccessibleForFree: true,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostClient />
    </>
  );
}
