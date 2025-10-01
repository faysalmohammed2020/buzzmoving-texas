"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

// --- Type definition remains the same ---
interface Blog {
  post_content: string;
  createdAt: string | number | Date;
  id: number;
  post_title: string;
}

// --- Main Component ---
export default function BlogPost() {
  const { id } = useParams();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Data Fetching remains the same ---
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        // NOTE: In a real app, you'd fetch only the single post based on 'id'
        const res = await fetch("/api/blogfetch", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch blog data");
        const data = await res.json();

        const transformed: Blog[] = data.map((item: any) => ({
          id: item.id,
          post_title: item.post_title,
          post_content: String(item.post_content ?? ""),
          createdAt: item.createdAt,
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

  // --- Read Time calculation remains the same ---
  const readTime = useMemo(() => {
    if (!post?.post_content) return 1;
    const words = post.post_content.replace(/<[^>]+>/g, " ").trim().split(/\s+/).length || 1;
    return Math.max(1, Math.ceil(words / 200));
  }, [post]);

  // --- Loading State (Minor Color Tweak) ---
  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin" />
          <p className="text-xl font-medium text-slate-700">Fetching content…</p>
        </div>
      </div>
    );
  }

  // --- Not Found State (Minor Color Tweak) ---
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

  // --- Main Professional Layout ---
  return (
    <div className="min-h-screen bg-white">
      {/* Article Header & Unique Back Button */}
      <header className="py-8 border-b border-slate-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-600 transition font-medium text-lg tracking-wide"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            <span className="hidden sm:inline">All Articles</span>
          </Link>
        </div>
      </header>
      
      {/* Unique Grid Layout for Content and Sidebar */}
      <div className="mx-auto max-w-7xl px-6 pt-16 pb-24 grid grid-cols-1 lg:grid-cols-12 lg:gap-12">
        
        {/* Post Content Area (Larger, Center-Left) */}
        <article className="lg:col-span-8">
          <div className="max-w-4xl">
            {/* Title Block */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-snug">
              {post.post_title}
            </h1>

            <div className="mt-4 text-xl text-slate-600 font-medium">
              {/* Optional: Add a short, punchy excerpt/sub-title here if available */}
              A deep dive into the latest trends and essential practices.
            </div>

            <div className="mt-8">
              <span className="text-sm font-semibold uppercase text-cyan-600 border border-cyan-200 bg-cyan-50 px-3 py-1 rounded-full tracking-wider">
                Feature
              </span>
            </div>

            {/* Main Content */}
            <div className="mt-12 prose prose-xl max-w-none text-slate-800
                prose-headings:text-slate-900 prose-headings:font-extrabold prose-h2:mt-16 prose-h3:mt-10
                prose-a:text-cyan-600 prose-a:font-medium hover:prose-a:text-cyan-700
                prose-img:rounded-xl prose-img:shadow-lg prose-img:border prose-img:border-slate-100 prose-img:mt-8 prose-img:mb-12
                prose-hr:my-16 prose-hr:border-slate-200
                prose-blockquote:border-l-4 prose-blockquote:border-cyan-500 prose-blockquote:bg-cyan-50/70 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:text-slate-700
                /* Enhanced Table Styling */
                [&_table]:w-full [&_table]:table-auto [&_table]:border-collapse [&_table]:my-10
                [&_th]:bg-cyan-50 [&_th]:font-bold [&_th]:text-slate-800
                [&_th]:border [&_td]:border [&_th]:border-slate-200 [&_td]:border-slate-200
                [&_th]:px-4 [&_td]:px-4 [&_th]:py-3 [&_td]:py-3
                [&_tbody_tr:nth-child(even)]:bg-slate-50
                overflow-x-auto">
              <div
                className="min-w-full"
                // Ensure your API returns safe HTML
                dangerouslySetInnerHTML={{ __html: post.post_content }}
              />
            </div>
          </div>
        </article>

        {/* Sidebar/Metadata Area (Smaller, Right) */}
        <aside className="lg:col-span-4 mt-12 lg:mt-0">
          <div className="lg:sticky lg:top-10">
            {/* Metadata Box */}
            <div className="p-6 border border-slate-100 rounded-xl bg-slate-50 shadow-md">
              <p className="text-sm font-semibold uppercase text-slate-500 mb-4 tracking-wider">Article Details</p>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <div>
                    <p className="text-xs text-slate-500">Published</p>
                    <p className="font-semibold text-slate-800">
                      {new Date(post.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <div>
                    <p className="text-xs text-slate-500">Reading Time</p>
                    <p className="font-semibold text-slate-800">{readTime} min read</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Share/Action Box */}
            <div className="mt-8 p-6 bg-cyan-600 rounded-xl shadow-xl shadow-cyan-500/30 text-white">
              <p className="text-xl font-bold mb-4">Found this useful?</p>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: post.post_title, url: window.location.href }).catch(() => {});
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    // In a real app, show a toast notification here
                  }
                }}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-3 text-cyan-700 font-bold shadow-lg hover:bg-slate-100 transition transform hover:scale-[1.01]"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.87 9 12.383 9 11.894c0-2.345-3.111-2.023-5.242-1.802C3.111 10.092 3 9.617 3 9.077c0-1.286.63-2.197 1.408-2.65C5.066 6.012 7.001 5.6 9 5.6h.461c2.158 0 3.737 1.838 3.737 4.092 0 1.954-.95 3.518-2.636 4.39-1.295.674-2.887 1.107-4.498 1.34-1.25.178-2.525.263-3.793.263-1.076 0-1.924-.13-2.548-.466-1.127-.615-1.704-1.636-1.704-2.846 0-1.135.53-2.115 1.547-2.67.625-.347 1.503-.497 2.63-.497 1.258 0 2.378.16 3.486.486" /></svg>
                Share This Article
              </button>
            </div>
            
            {/* Simple Call to Action */}
            <div className="mt-8 text-center">
              <Link href="/" className="text-cyan-600 font-semibold hover:text-cyan-700 transition">
                Browse All Articles →
              </Link>
            </div>

          </div>
        </aside>

      </div>
      
    </div>
  );
}