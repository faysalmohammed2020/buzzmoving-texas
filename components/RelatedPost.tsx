"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface ApiPost {
  id: number;
  post_title: string;
  createdAt: string;
  imageUrl?: string;
  excerpt?: string;
  post_status?: string;
}

interface RelatedPostProps {
  currentPostID: string;
}

// image url normalize (Invalid URL fix)
const normalizeImageUrl = (url?: string) => {
  if (!url) return null;

  // already absolute হলে 그대로
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  // "../../uploads/xxx" -> "/uploads/xxx"
  if (url.includes("/uploads/")) {
    return "/uploads/" + url.split("/uploads/")[1];
  }

  // "/image/xxx" টাইপ already ok
  if (url.startsWith("/")) return url;

  // fallback
  return "/" + url;
};

const RelatedPost: React.FC<RelatedPostProps> = ({ currentPostID }) => {
  const [relatedPosts, setRelatedPosts] = useState<ApiPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/blogpost", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch blog posts");

        const json = await res.json();

        // তোমার API: { data: [...] }
        const posts: ApiPost[] = Array.isArray(json?.data) ? json.data : [];

        const recentThree = posts
          // চাইলে Draft বাদ দেওয়ার জন্য এইটা ব্যবহার করো
          // .filter((p) => p.post_status === "publish")
          .filter((post) => String(post.id) !== String(currentPostID))
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )
          .slice(0, 3)
          .map((p) => ({
            ...p,
            imageUrl: normalizeImageUrl(p.imageUrl) || undefined,
          }));

        if (isMounted) setRelatedPosts(recentThree);
      } catch (err: unknown) {
        if (!isMounted) return;

        const message =
          err instanceof Error ? err.message : "Something went wrong";

        setError(message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPosts();
    return () => {
      isMounted = false;
    };
  }, [currentPostID]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 pb-12">
        <p className="text-center text-gray-500">Loading related posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 pb-12">
        <p className="text-center text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {relatedPosts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
            {post.imageUrl && (
              <Image
                src={post.imageUrl}
                alt={post.post_title}
                width={500}
                height={200}
                className="object-cover rounded-md mb-4"
              />
            )}

            <h3 className="text-xl font-semibold mb-2">{post.post_title}</h3>

            <p className="text-gray-500 text-sm mb-4">
              Published on:{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </p>

            {post.excerpt && (
              <p className="text-gray-700 leading-relaxed text-base">
                {post.excerpt.slice(0, 150)}...
              </p>
            )}

            <Link
              href={`/blog/${post.id}`}
              className="px-4 py-2 mt-4 inline-block text-sm rounded-[5px] font-medium text-white bg-blue-600 shadow hover:bg-blue-800 transition duration-300"
            >
              Read more
            </Link>
          </div>
        ))}
      </div>

      <div className="flex justify-center items-center mt-8">
        <Link
          href="/blog"
          className="px-4 py-2 bg-blue-600 text-white shadow-md hover:bg-blue-700 transition"
        >
          VIEW MORE
        </Link>
      </div>
    </div>
  );
};

export default RelatedPost;
