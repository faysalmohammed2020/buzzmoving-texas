"use client";
import React, {
  useState,
  useMemo,
  useCallback,
  Suspense,
  useEffect,
} from "react";
import useSWR from "swr";
import dynamic from "next/dynamic";

/** Lazy-loaded components (for faster initial load) */
const BlogPostForm = dynamic(() => import("@/components/BlogPostForm"), {
  suspense: true,
});
const PaginatedItems = dynamic(() => import("@/components/Pagination"), {
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
}

/** SWR fetcher (data layer + normalization) */
const fetcher = async (url: string): Promise<Blog[]> => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }
  const data = await response.json();

  const transformed: Blog[] = (data || []).map((item: any) => ({
    id: item.id,
    post_title: item.post_title,
    post_content:
      typeof item.post_content === "object" && item.post_content?.text
        ? item.post_content.text
        : String(item.post_content ?? ""),
    post_category: item.category,
    post_tags: item.tags,
    createdAt: item.createdAt,
  }));

  return transformed;
};

/** Debounce hook (for search) */
const useDebouncedValue = <T,>(value: T, delay: number): T => {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
};

const BlogManagement: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  /** SWR: data, error, mutate (cache + retry + revalidate) */
  const {
    data: blogsData,
    error,
    mutate,
  } = useSWR<Blog[]>("/api/blogpost", fetcher, {
    revalidateOnFocus: true,
    shouldRetryOnError: true,
  });

  const isLoading = !blogsData && !error;
  const blogs = blogsData ?? [];

  /** Debounced search value */
  const debouncedSearch = useDebouncedValue(searchQuery, 300);

  /** Pre-indexed blogs for faster filtering */
  const indexedBlogs = useMemo(
    () =>
      blogs.map((post) => ({
        ...post,
        _searchTitle: post.post_title?.toLowerCase().trim() || "",
      })),
    [blogs]
  );

  /** Filtered posts (title search only, behavior same as before) */
  const filteredPosts: Blog[] = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    if (!q) return indexedBlogs as Blog[];

    return indexedBlogs.filter((post: any) =>
      post._searchTitle.includes(q)
    ) as Blog[];
  }, [indexedBlogs, debouncedSearch]);

  /** Handlers — memoized with useCallback */

  const handleCreateNewClick = useCallback(() => {
    setEditBlogData(null);
    setIsFormVisible(true);
  }, []);

  const handleEditClick = useCallback((blog: Blog) => {
    setEditBlogData(blog);
    setIsFormVisible(true);
  }, []);

  const handleDeleteClick = useCallback(
    async (id: number) => {
      if (!window.confirm("Are you sure you want to delete this blog post?")) {
        return;
      }

      // ✅ Optimistic update: UI তে আগে মুছে ফেলি
      mutate(
        (current) => (current || []).filter((blog) => blog.id !== id),
        { revalidate: false }
      );

      try {
        const response = await fetch("/api/blogpost", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          throw new Error("Failed to delete");
        }

        alert("Blog post deleted successfully!");
        // পরে server থেকে fresh data নাও (sync)
        mutate();
      } catch (err) {
        alert("Failed to delete blog post. Please try again.");
        // rollback করার safest উপায়: revalidate
        mutate();
      }
    },
    [mutate]
  );

  const handleCloseModal = useCallback(() => {
    setIsFormVisible(false);
    setEditBlogData(null);
  }, []);

  /** Blog created/updated হওয়ার পর local cache update */
  const handleUpdateBlog = useCallback(
    (updatedBlog: Blog) => {
      setIsFormVisible(false);
      setEditBlogData(null);

      // ✅ Optimistic cache update
      mutate(
        (current) => {
          const existing = current || [];
          const idx = existing.findIndex((b) => b.id === updatedBlog.id);

          // New blog হলে শুরুতে add করো
          if (idx === -1) {
            return [updatedBlog, ...existing];
          }

          // পুরনো থাকলে replace করো
          const copy = [...existing];
          copy[idx] = updatedBlog;
          return copy;
        },
        { revalidate: false }
      );

      // চাইলে পরে fresh রি-ফেচ
      mutate();
    },
    [mutate]
  );

  /** Loading state → Skeleton */
  if (isLoading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen font-sans">
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-48 bg-gray-300 rounded animate-pulse" />
          <div className="flex gap-4 items-center">
            <div className="h-10 w-40 bg-gray-300 rounded animate-pulse" />
            <div className="h-10 w-32 bg-gray-300 rounded animate-pulse" />
          </div>
        </div>
        <hr />
        <section className="mt-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-full h-20 bg-gray-200 rounded-xl animate-pulse"
            />
          ))}
        </section>
      </div>
    );
  }

  /** Error state (same behavior, nicer wrapping) */
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
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-auto border border-slate-500 p-2 mr-4 rounded"
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

      {/* Content */}
      <section className="mb-6 overflow-y-auto rounded-xl p-2">
        <div className="flex justify-between py-4">
          <h2 className="text-2xl font-bold">
            Our Blogs:
            <span className="pl-1 text-cyan-600 font-bold">
              {filteredPosts.length}
            </span>
          </h2>
        </div>

        {/* Modal: Blog form (lazy + Suspense) */}
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

        {/* Paginated list (lazy + Suspense) */}
        <Suspense
          fallback={
            <div className="space-y-3 mt-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="w-full h-16 bg-gray-200 rounded-xl animate-pulse"
                />
              ))}
            </div>
          }
        >
          <PaginatedItems
            blogs={filteredPosts}
            itemsPerPage={8}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
          />
        </Suspense>
      </section>
    </div>
  );
};

export default BlogManagement;
