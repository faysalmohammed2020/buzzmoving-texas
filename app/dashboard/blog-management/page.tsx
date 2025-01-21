"use client";
import React, { useState, useEffect } from "react";
import BlogPostForm from "@/components/BlogPostForm";
import PaginatedItems from "@/components/Pagination";

export interface Blog {
  id: number;
  post_title: string;
  post_content: string;
  category: string;
  tags: string;
  createdAt: string;
}

const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  /** ✅ Fetch Blog from API **/
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/blogfetch");
      const data = await response.json();

      const transformedData: Blog[] = data.map((item: any) => ({
        id: item.id,
        post_title: item.post_title,
        post_content: item.post_content,
        category: item.category,
        tags: item.tags,
        createdAt: item.createdAt,
      }));

      setBlogs(transformedData);
    } catch (err) {
      setError("Failed to fetch blogs. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  /** ✅ Add or Edit Blog **/
  const handleSaveBlog = async (blog: Partial<Blog>) => {
    try {
      const response = await fetch("/api/blogpost", {
        method: blog.id ? "PUT" : "POST", // ✅ Use PUT if updating, POST if creating
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(blog),
      });

      if (!response.ok) throw new Error("Failed to save blog");

      await fetchBlogs(); // ✅ Refresh blog list after save
      setIsFormVisible(false);
      setEditBlogData(null);
    } catch (error) {
      alert("Error saving blog");
    }
  };

  /** ✅ Delete Blog **/
  const handleDeleteClick = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        const response = await fetch(`/api/blog/${id}`, { method: "DELETE" });

        if (!response.ok) throw new Error("Failed to delete blog");

        await fetchBlogs(); // Refresh after deletion
      } catch (error) {
        alert("Error deleting blog");
      }
    }
  };

  /** ✅ Open New Blog Form **/
  const handleCreateNewClick = () => {
    setEditBlogData(null);
    setIsFormVisible(true);
  };

  /** ✅ Open Edit Blog Form **/
  const handleEditClick = (blog: Blog) => {
    setEditBlogData(blog);
    setIsFormVisible(true);
  };

  /** ✅ Filter Blogs Based on Search Query **/
  const filteredPosts = blogs.filter((post) =>
    post.post_title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-slate-500 p-2 rounded"
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

      {isLoading ? (
        <p className="text-center text-gray-600">Loading blogs...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : (
        <PaginatedItems
          blogs={filteredPosts}
          itemsPerPage={8}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      )}

      {/* Modal for Blog Form */}
      {isFormVisible && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsFormVisible(false)}
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
                onClick={() => setIsFormVisible(false)}
                className="text-gray-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            <BlogPostForm
              initialData={editBlogData}
              onClose={() => setIsFormVisible(false)}
              onSave={handleSaveBlog}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManagement;
