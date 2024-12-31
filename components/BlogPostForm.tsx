"use client";
import React, { useState, useEffect } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi";
import RichTextEditor from "./RichTextEditor";

interface BlogPostFormProps {
  initialData?: {
    post_title: string;
    post_content: string;
  };
  onClose: () => void;
}

interface FormData {
  title: string;
  content: string;
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialData,
  onClose,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    content: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.post_title || "",
        content: initialData.post_content || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create a FormData instance
    const formToSubmit = {
      title: formData.title,
      content: formData.content,
    };

    // Send data to API route
    try {
      const response = await fetch("/api/blogpost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Ensure correct header
        },
        body: JSON.stringify(formToSubmit), // Stringify the object
      });

      const result = await response.json();

      if (response.ok) {
        // Alert on successful submission
        alert("Blog post saved successfully!");
        console.log("Blog post saved:", result);
        onClose(); // Close the form after submission
      } else {
        console.error("Error saving blog post:", result.error);
        alert("Failed to save blog post. Please try again.");
      }
    } catch (error) {
      console.error("Unexpected error:", error);
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
          {initialData ? "Update Blog" : "Publish Blog"}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm;
