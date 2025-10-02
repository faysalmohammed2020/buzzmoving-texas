"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import BlogPostForm from "@/components/BlogPostForm";

/** Types */
interface Blog {
  post_content: string;
  createdAt: string | number | Date;
  id: number;
  post_title: string;
  category?: string;
  tags?: string[] | string;
  post_status?: "draft" | "publish" | "private" | string;
}

export default function BlogPost() {
  const { id } = useParams();
  const { data: session, status } = useSession();
  const isAuthed = status === "authenticated";

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // === New: unified modal state (Create/Edit like your example) ===
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editBlogData, setEditBlogData] = useState<{
    id?: number;
    post_title: string;
    post_content: string;
    category?: string;
    tags?: string[] | string;
    post_status?: "draft" | "publish" | "private" | string;
  } | null>(null);

  /** Fetch posts */
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await fetch("/api/blogpost", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch blog data");
        const data = await res.json();

        const transformed: Blog[] = data.map((item: any) => ({
          id: item.id,
          post_title: item.post_title,
          post_content: String(item.post_content ?? ""),
          createdAt: item.createdAt,
          category: item.category ?? "",
          tags: item.tags ?? [],
          post_status: item.post_status ?? "draft",
        }));

        setBlogs(transformed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  const postId = Number(id);
  const post = useMemo(() => blogs.find((p) => p.id === postId), [blogs, postId]);

  const readTime = useMemo(() => {
    if (!post?.post_content) return 1;
    const words =
      post.post_content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length || 1;
    return Math.max(1, Math.ceil(words / 200));
  }, [post]);

  /** Open Edit like your Create/Edit modal */
  const openEdit = (focus: "title" | "content") => {
    if (!isAuthed) return signIn();
    if (!post) return;
    setEditBlogData({
      id: post.id,
      post_title: post.post_title || "",
      post_content: post.post_content || "",
      category: post.category || "",
      tags: post.tags ?? "",
      post_status: (post.post_status as any) || "draft",
    });
    setIsFormVisible(true);
  };

  /** Close modal */
  const handleCloseModal = () => {
    setIsFormVisible(false);
    setEditBlogData(null);
  };

  /** Update (PUT) from BlogPostForm */
  const handleUpdateBlog = async (payload: {
    id?: number;
    post_title: string;
    post_content: string;
    category?: string;
    tags?: string[] | string;
    post_status?: "draft" | "publish" | "private" | string;
  }) => {
    try {
      const res = await fetch("/api/blogpost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: payload.id ?? post?.id,
          post_title: payload.post_title,
          post_content: payload.post_content,
          category: payload.category ?? "",
          // Allow API to handle CSV/array parsing as in your note
          tags: payload.tags,
          post_status: payload.post_status ?? "draft",
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to update");
      }
      const updated: Blog = await res.json();

      setBlogs((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)));
      handleCloseModal();
    } catch (e) {
      alert((e as Error).message || "Update failed");
      console.error(e);
    }
  };

  /** Loading / Not Found */
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          <p className="text-xl font-medium text-slate-700">Loading Post…</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50">
        <div className="text-center p-10 bg-white rounded-xl shadow-2xl">
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-cyan-100 shadow-inner flex items-center justify-center">
            <span className="text-4xl">🤷‍♂️</span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900">Content Missing</h2>
          <p className="mt-2 text-lg text-slate-600">The requested article could not be located.</p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-6 py-3 text-lg font-semibold text-white shadow-lg shadow-cyan-500/30 hover:bg-cyan-700 transition transform hover:scale-[1.02]"
          >
            <span className="text-xl">←</span> Return to Blog Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative">
      {/* Header */}
      <header className="py-8 border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition font-medium text-lg tracking-wide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">All Articles</span>
          </Link>
        </div>
      </header>

      {/* Content + Sidebar */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 lg:gap-12">
        <article className="lg:col-span-8">
          <div className="max-w-4xl space-y-8">
            {/* Title with inline edit */}
            <div className="relative group">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-snug">
                {post.post_title}
              </h1>

              {isAuthed && (
                <button
                  type="button"
                  onClick={() => openEdit("title")}
                  title="Edit title"
                  className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100
                             transition rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}
            </div>

            {/* Optional excerpt */}
            <div className="text-xl text-slate-600 font-medium">
              A deep dive into the latest trends and essential practices.
            </div>

            {/* Label */}
            <div>
              <span className="text-sm font-semibold uppercase text-cyan-600 border border-cyan-200 bg-cyan-50 px-3 py-1 rounded-full tracking-wider">
                Feature
              </span>
            </div>

            {/* Content with inline edit */}
            <div className="relative group">
              {isAuthed && (
                <button
                  type="button"
                  onClick={() => openEdit("content")}
                  title="Edit content"
                  className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 focus:opacity-100
                             transition rounded-full bg-cyan-600 text-white p-2 shadow-lg hover:bg-cyan-700 z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none"
                    viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
              )}

              <div
                className="mt-2 prose prose-xl max-w-none text-slate-800
                  prose-headings:text-slate-900 prose-headings:font-extrabold prose-h2:mt-16 prose-h3:mt-10
                  prose-a:text-cyan-600 prose-a:font-medium hover:prose-a:text-cyan-700
                  prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-slate-100 prose-img:mt-8 prose-img:mb-12
                  prose-hr:my-16 prose-hr:border-slate-200
                  prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-50/70 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700
                  [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:my-10
                  [&_th]:bg-cyan-50 [&_th]:font-bold [&_th]:text-slate-800
                  [&_th]:border [&_td]:border [&_th]:border-slate-200 [&_td]:border-slate-200
                  [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-3
                  [&_tbody_tr:nth-child(even)]:bg-slate-50
                  [&_td]:text-center overflow-x-auto"
                dangerouslySetInnerHTML={{ __html: post.post_content }}
              />
            </div>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="lg:col-span-4 mt-12 lg:mt-0">
          <div className="lg:sticky lg:top-10">
            <div className="p-6 border border-slate-100 rounded-xl bg-slate-50 shadow-md">
              <p className="text-sm font-semibold uppercase text-slate-500 mb-4 tracking-wider">
                Article Details
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs text-slate-500">Published</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric", month: "short", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-slate-500">Reading Time</p>
                    <p className="font-semibold text-slate-800">{readTime} min read</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/" className="text-cyan-600 font-semibold hover:text-cyan-700 transition">
                Browse All Articles →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* === EDIT MODAL (same UX as your Create/Edit wrapper) === */}
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
                Edit Blog
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            <BlogPostForm
              initialData={editBlogData!}
              onClose={handleCloseModal}
              onUpdate={handleUpdateBlog}
            />
          </div>
        </div>
      )}
      {/* === End Modal === */}
    </div>
  );
}
