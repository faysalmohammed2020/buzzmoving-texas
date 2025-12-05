"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { placeData } from "@/app/data/placeData";

type BlogPost = {
  id: number;
  post_title: string;
  post_category?: string; // API field (string)
  category?: string | { id?: number; name?: string }; // sometimes object/string
  post_status?: string;
  createdAt?: string;
};

const normalize = (v: any) =>
  String(v ?? "")
    .toLowerCase()
    .trim();

// ✅ category name extractor (all possible API shapes)
const getPostCategoryName = (post: BlogPost) => {
  if (typeof post.post_category === "string" && post.post_category.trim()) {
    return post.post_category;
  }
  if (typeof post.category === "string" && post.category.trim()) {
    return post.category;
  }
  if (post.category && typeof post.category === "object") {
    return post.category.name ?? "";
  }
  return "";
};

const getPostCategoryId = (post: BlogPost) => {
  if (post.category && typeof post.category === "object") {
    return post.category.id;
  }
  return undefined;
};

const Categories = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchPosts = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/blogpost?limit=500&page=1", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error("Failed to load posts");
        const json = await res.json();

        const list: BlogPost[] = Array.isArray(json)
          ? json
          : Array.isArray(json?.data)
          ? json.data
          : [];

        // ✅ NO status filtering anymore (Draft included)
        setPosts(list);
      } catch (e) {
        if ((e as any).name !== "AbortError") console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
    return () => controller.abort();
  }, []);

  // ✅ group posts by normalized category for fast matching
  const grouped = useMemo(() => {
    const map: Record<string, BlogPost[]> = {};
    for (const p of posts) {
      const catName = normalize(getPostCategoryName(p));
      if (!catName) continue;
      if (!map[catName]) map[catName] = [];
      map[catName].push(p);
    }
    return map;
  }, [posts]);

  return (
    <div className="container mx-auto mt-12 px-6 md:px-14 lg:px-28">
      <h2 className="text-4xl font-bold text-center text-blue-900 mb-8">
        State Categories
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 py-10">
          Loading categories...
        </div>
      ) : (
        <Accordion
          type="single"
          collapsible
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          {placeData.map((item) => {
            const placeNameNorm = normalize(item.name);

            // ✅ exact match first
            let postsInCategory = grouped[placeNameNorm] || [];

            // ✅ fallback fuzzy match (if exact empty)
            if (postsInCategory.length === 0) {
              const fuzzyKey = Object.keys(grouped).find(
                (k) => k.includes(placeNameNorm) || placeNameNorm.includes(k)
              );
              if (fuzzyKey) postsInCategory = grouped[fuzzyKey];
            }

            // ✅ also fallback by id if any API category object has id
            if (postsInCategory.length === 0) {
              postsInCategory = posts.filter((p) => getPostCategoryId(p) === item.id);
            }

            return (
              <AccordionItem
                key={item.id}
                value={`item-${item.id}`}
                className="border-b border-gray-300 pb-2"
              >
                <AccordionTrigger className="flex justify-between items-center text-blue-900 text-lg font-semibold">
                  {item.name}
                </AccordionTrigger>

                <AccordionContent className="text-md text-gray-700 mt-2">
                  <ul className="list-none space-y-2">
                    {postsInCategory.map((post) => (
                      <li
                        key={post.id}
                        className="text-slate-800 hover:text-blue-600 hover:font-bold hover:underline"
                      >
                        <a href={`/blog/${post.id}`}>{post.post_title}</a>
                      </li>
                    ))}

                    {postsInCategory.length === 0 && (
                      <li className="text-gray-500">
                        No posts available for this category.
                      </li>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
};

export default Categories;
