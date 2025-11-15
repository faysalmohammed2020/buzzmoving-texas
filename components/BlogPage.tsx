"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

interface Blog {
  id: number;
  post_title: string;
  post_content: string;
  post_category: string;
  post_tags: string;
  createdAt: string;
  imageUrl: string;
  excerpt: string;
  readTime: number;
}

// Helper function to safely extract the first image
const extractFirstImage = (htmlContent: string): string => {
  const fallback = "/placeholder-blog.svg";

  if (typeof window === "undefined") return fallback;

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent || "", "text/html");
    const imgElement = doc.querySelector("img");
    if (!imgElement) return fallback;

    let src = imgElement.getAttribute("src") || "";

    const baseURL =
      process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

    if (src.startsWith("/public/")) {
      src = src.replace(/^\/public\//, "/");
    }

    if (src.startsWith("/")) {
      src = `${baseURL}${src}`;
    } else {
      const u = new URL(src, baseURL);
      const cleanPath = u.pathname.replace(/^\/public\//, "/");
      src = `${baseURL}${cleanPath}${u.search}${u.hash}`;
    }

    return src || fallback;
  } catch {
    return fallback;
  }
};

// 🔹 Skeleton Card (loading state-এর জন্য)
const BlogCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-xl border border-gray-100 animate-pulse h-full flex flex-col">
    <div className="relative w-full h-48 bg-gray-200" />
    <div className="p-6 flex flex-col flex-grow gap-3">
      <div className="h-3 w-20 bg-gray-200 rounded-full" />
      <div className="h-6 w-3/4 bg-gray-200 rounded-md" />
      <div className="space-y-2 mt-2">
        <div className="h-3 w-full bg-gray-200 rounded-md" />
        <div className="h-3 w-5/6 bg-gray-200 rounded-md" />
        <div className="h-3 w-2/3 bg-gray-200 rounded-md" />
      </div>
      <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="h-3 w-24 bg-gray-200 rounded-full" />
        <div className="h-3 w-16 bg-gray-200 rounded-full" />
      </div>
    </div>
  </div>
);

// 🔹 আলাদা BlogCard (memoized → re-render কম)
const BlogCard: React.FC<{ post: Blog }> = React.memo(({ post }) => {
  const postDate = useMemo(
    () =>
      new Date(post.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    [post.createdAt]
  );

  return (
    <Link
      href={`/blog/${post.id}`}
      passHref
      className="group"
    >
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col border border-gray-100">
        {/* Image */}
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={post.imageUrl}
            alt={post.post_title}
            fill
            loading="lazy"
            style={{ objectFit: "cover" }}
            className="group-hover:scale-105 transition-transform duration-500 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <span className="text-xs font-semibold uppercase text-indigo-600 tracking-widest mb-2">
            {post.post_category}
          </span>

          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-indigo-700 transition-colors">
            {post.post_title}
          </h2>

          <div className="flex-grow">
            <p className="text-gray-600 line-clamp-3">
              {post.excerpt}...
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {postDate}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="w-4 h-4 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {post.readTime} min read
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});
BlogCard.displayName = "BlogCard";

const BlogPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 6;

  // --- Data Fetching + All preprocessing এক জায়গায় ---
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/blogpost", { cache: "no-store" });
        if (!response.ok) throw new Error("Network response was not ok");
        const data = await response.json();

        const transformedData: Blog[] = (data || []).map((item: any) => {
          const rawContent =
            typeof item.post_content === "object" && item.post_content?.text
              ? item.post_content.text
              : String(item.post_content || "");

          const plainText = rawContent
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
          const wordCount = plainText ? plainText.split(/\s+/).length : 0;
          const readTime = Math.max(1, Math.ceil(wordCount / 200));
          const excerpt = plainText.slice(0, 150);

          const imageUrl = extractFirstImage(rawContent);

          return {
            id: item.id,
            post_title: item.post_title,
            post_content: rawContent,
            post_category: item.category || "General",
            post_tags: item.tags || "",
            createdAt: item.createdAt || new Date().toISOString(),
            imageUrl,
            excerpt,
            readTime,
          };
        });

        setBlogs(transformedData);
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to load articles. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // ✅ Global priority: image থাকা পোস্ট আগে, তারপর নরমাল
  const prioritizedBlogs = useMemo(() => {
    const hasRealImage = (b: Blog) =>
      b.imageUrl && b.imageUrl !== "/placeholder-blog.svg";
    return [...blogs].sort((a, b) => {
      const aHas = hasRealImage(a) ? 1 : 0;
      const bHas = hasRealImage(b) ? 1 : 0;
      return bHas - aHas;
    });
  }, [blogs]);

  const totalPages = useMemo(
    () => Math.ceil(prioritizedBlogs.length / postsPerPage) || 1,
    [prioritizedBlogs.length, postsPerPage]
  );

  const currentPosts = useMemo(() => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    return prioritizedBlogs.slice(indexOfFirstPost, indexOfLastPost);
  }, [prioritizedBlogs, currentPage, postsPerPage]);

  const paginate = (pageNumber: number) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getPageNumbers = () => {
    const maxVisiblePages = 3;

    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= maxVisiblePages) {
      return [1, 2, 3, "...", totalPages];
    } else if (currentPage > totalPages - maxVisiblePages) {
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    } else {
      return [
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      ];
    }
  };

  // --- Loading State (Skeleton) ---
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-16">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12">
            <div className="h-10 w-52 bg-gray-200 rounded-lg mx-auto mb-3 animate-pulse" />
            <div className="h-4 w-80 bg-gray-200 rounded mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {Array.from({ length: 6 }).map((_, i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-red-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg border border-red-200">
          <p className="text-xl font-semibold text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Editorial Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">
            Our Blogs
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest industry deep-dives, expert opinions,
            and essential guides.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {currentPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-16">
            <nav className="flex space-x-1 p-2 bg-white rounded-xl shadow-lg border border-gray-200">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                ← Prev
              </button>

              {getPageNumbers().map((page, index) => (
                <div key={index}>
                  {page === "..." ? (
                    <span className="px-4 py-2 text-gray-500">...</span>
                  ) : (
                    <button
                      onClick={() => paginate(Number(page))}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                        currentPage === page
                          ? "bg-indigo-600 text-white shadow-md hover:bg-indigo-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </div>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                Next →
              </button>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
};

export default dynamic(() => Promise.resolve(BlogPage), { ssr: false });
