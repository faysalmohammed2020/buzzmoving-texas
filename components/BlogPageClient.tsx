"use client";

import React, { useState, useEffect, useMemo, useTransition, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

interface Blog {
  id: number;
  post_title: string;
  post_category: string;
  post_tags: string;
  createdAt: string;
  imageUrl: string;
  excerpt: string;
  readTime: number;
}

interface BlogResponse {
  data: Blog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** ✅ normalize any kind of relative image path safely for next/image */
const normalizeImageUrl = (src?: string) => {
  const fallback = "/placeholder-blog.svg";
  if (!src) return fallback;

  let s = String(src).trim();
  if (s.startsWith("http://") || s.startsWith("https://")) return s;

  s = s.replace(/^(\.\.\/)+/g, "/");
  s = s.replace(/^(\.\/)+/g, "/");
  if (!s.startsWith("/")) s = "/" + s;
  s = s.replace(/^\/public\//, "/");
  if (s === "/" || s.length < 2) return fallback;

  return s;
};

const BlogCardSkeleton: React.FC = React.memo(() => (
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
));
BlogCardSkeleton.displayName = "BlogCardSkeleton";

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

  const safeImg = normalizeImageUrl(post.imageUrl);

  return (
    <Link href={`/blog/${post.id}`} className="group">
      <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-1 h-full flex flex-col border border-gray-100">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={safeImg}
            alt={post.post_title}
            fill
            loading="lazy"
            style={{ objectFit: "cover" }}
            className="group-hover:scale-105 transition-transform duration-500 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <span className="text-xs font-semibold uppercase text-indigo-600 tracking-widest mb-2">
            {post.post_category}
          </span>

          <h2 className="text-2xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-indigo-700 transition-colors">
            {post.post_title}
          </h2>

          <p className="text-gray-600 line-clamp-3 flex-grow">
            {post.excerpt}...
          </p>

          <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
            <span>{postDate}</span>
            <span>{post.readTime} min read</span>
          </div>
        </div>
      </div>
    </Link>
  );
});
BlogCard.displayName = "BlogCard";

export default function BlogPageClient({
  initialBlogs,
  initialMeta,
  postsPerPage,
}: {
  initialBlogs: Blog[];
  initialMeta: BlogResponse["meta"];
  postsPerPage: number;
}) {
  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [currentPage, setCurrentPage] = useState(initialMeta.page || 1);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages || 1);

  const [initialLoading] = useState(false); // ✅ first render already has data
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isPending, startTransition] = useTransition();

  const fetchPage = useCallback(async (page: number, controller: AbortController) => {
    setError(null);
    setPageLoading(true);

    try {
      const res = await fetch(
        `/api/blogpost?page=${page}&limit=${postsPerPage}`,
        { signal: controller.signal, cache: "no-store" }
      );
      if (!res.ok) throw new Error("Failed to fetch blogs");
      const json: BlogResponse = await res.json();

      startTransition(() => {
        setBlogs(json.data || []);
        setTotalPages(json.meta?.totalPages || 1);
      });

      // ✅ prefetch next page silently (faster next click)
      if (page < (json.meta?.totalPages || 1)) {
        fetch(`/api/blogpost?page=${page + 1}&limit=${postsPerPage}`, {
          cache: "no-store",
        }).catch(() => {});
      }
    } catch (e: any) {
      if (e.name !== "AbortError") {
        console.error(e);
        setError("Failed to load articles. Please check your connection.");
      }
    } finally {
      setPageLoading(false);
    }
  }, [postsPerPage, startTransition]);

  useEffect(() => {
    // currentPage=1 (server) হলে আর fetch লাগবে না
    if (currentPage === initialMeta.page) return;

    const controller = new AbortController();
    fetchPage(currentPage, controller);
    return () => controller.abort();
  }, [currentPage, fetchPage, initialMeta.page]);

  const paginate = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setCurrentPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getPageNumbers = () => {
    const maxVisiblePages = 3;
    if (totalPages <= 6)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= maxVisiblePages)
      return [1, 2, 3, "...", totalPages];
    if (currentPage > totalPages - maxVisiblePages)
      return [1, "...", totalPages - 2, totalPages - 1, totalPages];
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  };

  if (initialLoading) {
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
        <div className="text-center mb-12">
          <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight">
            Our Blogs
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Stay updated with our latest industry deep-dives, expert opinions,
            and essential guides.
          </p>
        </div>

        {(pageLoading || isPending) && (
          <div className="w-full h-1 bg-gray-200 rounded mb-6 overflow-hidden">
            <div className="h-full w-1/3 bg-indigo-500 animate-pulse" />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {blogs.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>

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
}
