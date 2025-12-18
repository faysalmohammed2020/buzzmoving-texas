"use client";
import React, { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";

interface BlogPostFormProps {
  initialData?: {
    id?: number;
    post_title: string;
    post_content: string;
    post_category?: string;
    post_tags?: string;

    // ✅ NEW (Int in DB)
    post_author?: number | null;
  } | null;
  onClose: () => void;
  onUpdate: (updatedBlog: unknown) => void;
}

interface FormData {
  id?: number;
  title: string;
  content: string;
  category: string;
  tags?: string;

  // ✅ NEW: allow "" so input can be blank
  authorId: number | "";
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialData,
  onClose,
  onUpdate,
}) => {
  const [formData, setFormData] = useState<FormData>({
    id: initialData?.id || undefined,
    title: initialData?.post_title || "",
    content: initialData?.post_content || "",
    category: initialData?.post_category || "",
    tags: initialData?.post_tags || "",

    // ✅ NEW
    authorId: typeof initialData?.post_author === "number" ? initialData.post_author : "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || undefined,
        title: initialData.post_title || "",
        content: initialData.post_content || "",
        category: initialData.post_category || "",
        tags: initialData.post_tags || "",
        authorId: typeof initialData.post_author === "number" ? initialData.post_author : "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // ✅ special handling for number field
    if (name === "authorId") {
      const v = value.trim();
      setFormData((prev) => ({
        ...prev,
        authorId: v === "" ? "" : Number(v),
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formToSubmit: Record<string, unknown> = {
      id: formData.id,
      post_title: formData.title,
      post_content: formData.content,
      category: formData.category,
      tags: formData.tags || "",
    };

    // ✅ only send post_author if provided (Int)
    if (typeof formData.authorId === "number" && !Number.isNaN(formData.authorId)) {
      formToSubmit.post_author = formData.authorId;
    } else {
      formToSubmit.post_author = null; // or omit; choose based on your DB constraint
    }

    try {
      const response = await fetch("/api/blogpost", {
        method: formData.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formToSubmit),
      });

      const result = await response.json();

      if (response.ok) {
        alert(formData.id ? "Blog updated successfully!" : "Blog post created!");
        onUpdate(result);
        onClose();
      } else {
        alert(result?.error || "Failed to save blog post. Please try again.");
      }
    } catch (error: unknown) {
      console.error(error);
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div>
        <label htmlFor="title" className="block text-lg font-medium mb-2">
          Blog Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter blog title"
          required
        />
      </div>

      {/* ✅ NEW AUTHOR (INT) FIELD */}
      <div>
        <label htmlFor="authorId" className="block text-lg font-medium mb-2">
         Post Author
        </label>
        <input
          type="number"
          id="authorId"
          name="authorId"
          value={formData.authorId}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter author id (e.g. 1)"
          min={1}
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-lg font-medium mb-2">
          Category
        </label>
        <input
          type="text"
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter blog category"
          required
        />
      </div>

      <div>
        <label htmlFor="tags" className="block text-lg font-medium mb-2">
          Tags (Optional)
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter tags separated by commas"
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-lg font-medium mb-2">
          Blog Content
        </label>
        <RichTextEditor
          value={formData.content}
          onChange={(content) =>
            setFormData((prev) => ({
              ...prev,
              content,
            }))
          }
        />
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {formData.id ? "Update Blog" : "Publish Blog"}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm;
