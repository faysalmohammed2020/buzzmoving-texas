// app/[slug]/page.tsx
import BlogPostClient from "@/app/(main)/blog/[id]/BlogPostClient";

export default async function PostSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
