"use client";
import React, { useState } from "react";
import { postdata as initialPostData } from "@/app/data/postdata";
import BlogPostForm from "@/components/BlogPostForm";

const BlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState(initialPostData); // State to store blogs
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [editBlogData, setEditBlogData] = useState(null); // State to track the blog being edited

  const handleCreateNewClick = () => {
    setEditBlogData(null); // Reset to null for new blog creation
    setIsFormVisible(true); // Show the modal
  };

  const handleEditClick = (blog: any) => {
    setEditBlogData(blog); // Pass blog data to the modal
    setIsFormVisible(true); // Show the modal
  };

  const handleDeleteClick = (index: number) => {
    // Remove the blog at the specified index
    const updatedBlogs = blogs.filter((_, i) => i !== index);
    setBlogs(updatedBlogs); // Update the blogs state
  };

  const handleCloseModal = () => {
    setIsFormVisible(false); // Close the modal
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
      </header>

      {/* Analytics and Blogs Section */}
      <section className="mb-6">
        <div className="flex justify-between py-2">
          <h2 className="text-2xl font-bold mb-4">
            Our Blogs:{" "}
            <span className="pl-1 text-cyan-600 font-bold">{blogs.length}</span>
          </h2>
          <button
            onClick={handleCreateNewClick}
            className="text-lg font-bold bg-blue-500 px-4 py-2 text-white rounded-xl"
          >
            Create New +
          </button>
        </div>

        {isFormVisible && (
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center z-50"
            role="dialog"
            aria-modal="true"
            onClick={handleCloseModal} // Close modal when clicking outside
          >
            <div
              className="bg-white rounded-xl p-8 w-11/12 max-w-3xl shadow-lg"
              onClick={(e) => e.stopPropagation()} // Prevent close when clicking inside modal
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

              {/* Pass blog data to BlogPostForm */}
              <BlogPostForm
                initialData={editBlogData}
                onClose={handleCloseModal}
              />
            </div>
          </div>
        )}

        {/* Blogs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {blogs.map((blog, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl p-6 border border-gray-200 flex flex-col justify-between"
            >
              <div className="mb-4">
                <p className="font-medium text-md text-gray-800">
                  {blog.post_title || "Untitled"}
                </p>
              </div>
              <div className="flex gap-2 justify-between">
                <button
                  className="text-blue-500 text-sm font-bold"
                  onClick={() => handleEditClick(blog)}
                >
                  Edit
                </button>
                <button
                  className="text-sm font-bold rounded-xl bg-red-500 px-2 py-1 text-white"
                  onClick={() => handleDeleteClick(index)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default BlogManagement;
