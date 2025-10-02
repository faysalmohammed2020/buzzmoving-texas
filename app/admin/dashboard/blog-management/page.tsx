"use client";
import React, { useState, useEffect } from "react";
import BlogPostForm from "@/components/BlogPostForm";
import PaginatedItems from "@/components/Pagination";

interface Blog {
  id: number;
  post_title: string;
  post_content: string; // Ensure post_content is a string
  post_category: string;
  post_tags: string;
  createdAt: any;
}

const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/blogpost");
        const data = await response.json();

        console.log("Raw API Response:", data);

        const transformedData: Blog[] = data.map((item: any) => ({
          id: item.id,
          post_title: item.post_title,
          post_content:
            typeof item.post_content === "object" && item.post_content.text
              ? item.post_content.text
              : String(item.post_content), // Extract text content only
          post_category: item.category,
          post_tags: item.tags,
          createdAt: item.createdAt,
        }));

        console.log("Transformed Data:", transformedData);

        setBlogs(transformedData);
      } catch (err) {
        setError("Failed to fetch blogs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const filteredPosts = blogs.filter((post) =>
    post.post_title
      ?.toLowerCase()
      .trim()
      .includes(searchQuery.toLowerCase().trim())
  );

  const handleCreateNewClick = () => {
    setEditBlogData(null);
    setIsFormVisible(true);
  };

  const handleEditClick = (blog: Blog) => {
    setEditBlogData(blog);
    setIsFormVisible(true);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        const response = await fetch("/api/blogpost", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        if (response.ok) {
          alert("Blog post deleted successfully!");
          setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
        } else {
          alert("Failed to delete blog post. Please try again.");
        }
      } catch (error) {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleCloseModal = () => {
    setIsFormVisible(false);
  };

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading blogs...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  const handleUpdateBlog = (updatedBlog: Blog) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) => (blog.id === updatedBlog.id ? updatedBlog : blog))
    );
  };

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

      <section className="mb-6 overflow-y-auto rounded-xl p-2">
        <div className="flex justify-between py-4">
          <h2 className="text-2xl font-bold">
            Our Blogs:
            <span className="pl-1 text-cyan-600 font-bold">
              {filteredPosts.length}
            </span>
          </h2>
        </div>

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
              <BlogPostForm
                initialData={editBlogData}
                onClose={handleCloseModal}
                onUpdate={handleUpdateBlog}
              />
            </div>
          </div>
        )}

        <PaginatedItems
          blogs={filteredPosts}
          itemsPerPage={8}
          onEdit={handleEditClick}
          onDelete={handleDeleteClick}
        />
      </section>
    </div>
  );
};

export default BlogManagement;
