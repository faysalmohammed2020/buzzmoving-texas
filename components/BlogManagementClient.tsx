"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
  useTransition,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Image from "next/image";

/** Lazy-loaded components (for faster initial load) */
const BlogPostForm = dynamic(() => import("@/components/BlogPostForm"), {
  suspense: true,
});

/** Types */
interface Blog {
  id: number;
  post_title: string;
  post_content: string;
  post_category: string;
  post_tags: string;
  createdAt: any;
  imageUrl?: string | null;
  excerpt?: string;
  readTime?: number;
  _searchTitle?: string;
}

interface BlogResponse {
  data: any[];
  items?: any[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** ✅ normalize any kind of relative image path safely for next/image */
const normalizeImageUrl = (src?: string | null) => {
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

/** ✅ pull first image from html content */
const extractFirstImage = (html: string) => {
  if (!html) return null;
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m?.[1] || null;
};

/** ✅ strip html -> first non-empty line (excerpt) */
const getFirstLine = (html: string) => {
  const text = html.replace(/<[^>]*>/g, " ");
  const line =
    text
      .split("\n")
      .map((s) => s.trim())
      .find(Boolean) || "";
  return line;
};

const SkeletonCard: React.FC = React.memo(() => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 animate-pulse">
    <div className="w-full h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 w-20 bg-gray-200 rounded" />
      <div className="h-6 w-3/4 bg-gray-200 rounded" />
      <div className="h-3 w-full bg-gray-200 rounded" />
      <div className="h-3 w-5/6 bg-gray-200 rounded" />
      <div className="h-3 w-2/3 bg-gray-200 rounded" />
    </div>
  </div>
));
SkeletonCard.displayName = "SkeletonCard";

/** ✅ Admin card view */
const AdminBlogCard: React.FC<{
  post: Blog;
  onEdit: (b: Blog) => void;
  onDelete: (id: number) => void;
}> = React.memo(({ post, onEdit, onDelete }) => {
  const safeImg = normalizeImageUrl(post.imageUrl);

  const postDate = useMemo(
    () =>
      post.createdAt
        ? new Date(post.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : "—",
    [post.createdAt]
  );

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col">
      <Link href={`/blog/${post.id}`} className="group">
        <div className="relative w-full h-48 overflow-hidden">
          <Image
            src={safeImg}
            alt={post.post_title}
            fill
            loading="lazy"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        <span className="text-xs font-semibold uppercase text-indigo-600 tracking-widest mb-2">
          {post.post_category || "Uncategorized"}
        </span>

        <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2 line-clamp-2">
          {post.post_title}
        </h2>

        <p className="text-gray-600 line-clamp-3 flex-1">
          {post.excerpt || "—"}
        </p>

        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
          <span>{postDate}</span>
          <span>{post.readTime || 1} min read</span>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => onEdit(post)}
            className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(post.id)}
            className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
});
AdminBlogCard.displayName = "AdminBlogCard";

const BlogManagementClient: React.FC<{
  initialBlogs: any[];
  initialMeta: NonNullable<BlogResponse["meta"]>;
  itemsPerPage: number; // 9
}> = ({ initialBlogs, initialMeta, itemsPerPage }) => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);

  // ✅ search input
  const [searchQuery, setSearchQuery] = useState("");

  /** ✅ server-side pagination states */
  const [currentPage, setCurrentPage] = useState(initialMeta.page || 1);
  const [totalPages, setTotalPages] = useState(initialMeta.totalPages || 1);
  const [totalBlogs, setTotalBlogs] = useState(initialMeta.total || 0);

  const [blogs, setBlogs] = useState<Blog[]>(() => {
    const list = initialBlogs || [];
    return list.map(mapApiToBlog);
  });

  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  /** ✅ force reload token */
  const [reloadTick, setReloadTick] = useState(0);
  const forceReload = useCallback(() => setReloadTick((t) => t + 1), []);

  /** ✅ only skip fetch on VERY first mount */
  const didSkipInitial = useRef(false);

  // ✅ search change হলে auto page-1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  /** ✅ Fetch one page from server (NOW WITH GLOBAL SEARCH) */
  useEffect(() => {
    if (!didSkipInitial.current && currentPage === initialMeta.page && !searchQuery) {
      didSkipInitial.current = true;
      return;
    }

    const controller = new AbortController();

    const fetchPageBlogs = async () => {
      setError(null);
      setPageLoading(true);

      try {
        const qs = new URLSearchParams();
        qs.set("page", String(currentPage));
        qs.set("limit", String(itemsPerPage));
        if (searchQuery.trim()) qs.set("q", searchQuery.trim()); // ✅ GLOBAL SEARCH PARAM

        const res = await fetch(`/api/blogpost?${qs.toString()}`, {
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch blogs");

        const json: BlogResponse | any = await res.json();

        const list: any[] = Array.isArray(json)
          ? json
          : json.data || json.items || [];

        const meta = Array.isArray(json)
          ? {
              page: currentPage,
              limit: itemsPerPage,
              total: list.length,
              totalPages: Math.max(1, Math.ceil(list.length / itemsPerPage)),
            }
          : json.meta || {
              page: currentPage,
              limit: itemsPerPage,
              total: list.length,
              totalPages: 1,
            };

        const mapped: Blog[] = list.map(mapApiToBlog);

        startTransition(() => {
          setBlogs(mapped);
          setTotalPages(meta.totalPages || 1);
          setTotalBlogs(meta.total || mapped.length);
        });

      } catch (e: any) {
        if (e.name !== "AbortError") {
          console.error(e);
          setError("Failed to fetch blogs. Please try again later.");
        }
      } finally {
        setPageLoading(false);
      }
    };

    fetchPageBlogs();
    return () => controller.abort();
  }, [currentPage, itemsPerPage, reloadTick, initialMeta.page, searchQuery]);

  /** ✅ Local filter (safe backup) */
  const filteredPosts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return blogs;
    return blogs.filter((b) => (b._searchTitle || "").includes(q));
  }, [blogs, searchQuery]);

  const handleCreateNewClick = useCallback(() => {
    setEditBlogData(null);
    setIsFormVisible(true);
  }, []);

  const handleEditClick = useCallback(async (blog: Blog) => {
    if (!blog.post_content) {
      try {
        const res = await fetch(`/api/blogpost?id=${blog.id}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const full = await res.json();
          blog = mapApiToBlog(full);
        }
      } catch {}
    }
    setEditBlogData(blog);
    setIsFormVisible(true);
  }, []);

  const handleDeleteClick = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this blog post?"))
        return;

      setBlogs((prev) => prev.filter((b) => b.id !== id)); // optimistic

      try {
        const response = await fetch("/api/blogpost", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) throw new Error("Failed to delete");

        alert("Blog post deleted successfully!");
        forceReload();
      } catch {
        alert("Failed to delete blog post. Please try again.");
        forceReload();
      }
    },
    [forceReload]
  );

  const handleCloseModal = useCallback(() => {
    setIsFormVisible(false);
    setEditBlogData(null);
  }, []);

  /** ✅ Blog updated/created -> go page 1 + force refetch */
  const handleUpdateBlog = useCallback(() => {
    setIsFormVisible(false);
    setEditBlogData(null);

    if (currentPage !== 1) setCurrentPage(1);
    else forceReload();
  }, [currentPage, forceReload]);

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
    return [
      1,
      "...",
      currentPage - 1,
      currentPage,
      currentPage + 1,
      "...",
      totalPages,
    ];
  };

  if (error) {
    return (
      <p className="text-center text-red-500">
        Failed to fetch blogs. Please try again later.
      </p>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 border border-slate-400 p-2 rounded-lg"
          />
          <button
            onClick={handleCreateNewClick}
            className="text-lg font-bold bg-blue-500 px-4 py-2 text-white rounded-xl"
          >
            Create New +
          </button>
        </div>
      </div>

      <hr />

      {(pageLoading || isPending) && (
        <div className="w-full h-1 bg-gray-200 rounded my-4 overflow-hidden">
          <div className="h-full w-1/3 bg-indigo-500 animate-pulse" />
        </div>
      )}

      <div className="flex justify-between items-center mt-4 mb-4">
        <h2 className="text-xl font-bold">
          Our Blogs: <span className="text-cyan-600">{totalBlogs}</span>
        </h2>
        <span className="text-sm text-slate-500">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {pageLoading && blogs.length === 0 ? (
          Array.from({ length: itemsPerPage }).map((_, i) => (
            <SkeletonCard key={i} />
          ))
        ) : filteredPosts.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            No posts found.
          </div>
        ) : (
          filteredPosts.map((post) => (
            <AdminBlogCard
              key={post.id}
              post={post}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))
        )}
      </section>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-14">
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

      {/* Modal */}
      {isFormVisible && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={handleCloseModal}
        >
          <div
            className="bg-white rounded-xl p-8 w-11/12 max-w-4xl shadow-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-2">
              <h2 className="text-2xl font-bold">
                {editBlogData ? "Edit Blog" : "Create New Blog"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <Suspense
              fallback={
                <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              }
            >
              <BlogPostForm
                initialData={editBlogData}
                onClose={handleCloseModal}
                onUpdate={handleUpdateBlog}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagementClient;

/** ---------- helpers ---------- */
function mapApiToBlog(item: any): Blog {
  const rawContent =
    typeof item.post_content === "object" && item.post_content?.text
      ? item.post_content.text
      : String(item.post_content ?? "");

  const title = String(item.post_title || "");

  const apiImage =
    item.imageUrl ||
    item.image_url ||
    item.thumbnail ||
    item.thumbnailUrl ||
    item.thumbnail_url ||
    item.post_thumbnail ||
    item.post_image ||
    item.featured_image ||
    item.featuredImage ||
    item.cover_image ||
    item.banner ||
    item.image ||
    null;

  const contentImage = extractFirstImage(rawContent);
  const imageUrl = apiImage || contentImage || null;

  const firstLine = getFirstLine(rawContent);
  const excerpt = firstLine.slice(0, 160);

  const wordCount = rawContent.split(/\s+/).filter(Boolean).length;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return {
    id: Number(item.id),
    post_title: title,
    post_content: rawContent,
    post_category: item.post_category || item.category || "",
    post_tags: item.post_tags || item.tags || "",
    createdAt: item.createdAt ?? item.post_date ?? null,
    imageUrl,
    excerpt,
    readTime,
    _searchTitle: title.toLowerCase().trim(),
  };
}
