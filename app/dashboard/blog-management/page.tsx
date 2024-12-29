"use client";
import React, { useState } from "react";
import { postdata } from "@/app/data/postdata";
import BlogPostForm from "@/components/BlogPostForm";

const BlogManagement: React.FC = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);

  const handleCreateNewClick = () => {
    setIsFormVisible(!isFormVisible);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
      </header>

      {/* Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Team Payments */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-xl font-bold">Total Blogs</h3>
          <div className="flex mt-4 items-center">
            <div className="text-2xl ml-2 font-bold">301</div>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">Total Likes</h3>
          <h2 className="text-2xl font-bold mt-2 ml-2">5,839</h2>
        </div>

        {/* Income Statistics */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">Total Comments</h3>
          <h3 className="text-xl mt-2 ml-2 font-bold">5034</h3>
        </div>

        {/* Plan Upgrade */}
        {/* Income Statistics */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">Total Share</h3>
          <h3 className="text-xl mt-2 ml-2 font-bold">731</h3>
        </div>
      </section>

      {/* Recently Payments */}
      <section className="mb-6">
        <div className="w-full">
          <div>
            <div className="flex justify-between py-2">
              <h2 className="text-2xl font-bold mb-4">Our Recent Blogs</h2>
              <button
                onClick={handleCreateNewClick}
                className="text-lg font-bold bg-blue-500 px-4 text-white rounded-xl"
              >
                Create New +
              </button>
            </div>

            {isFormVisible && (
              <div className="bg-white shadow-md rounded-xl px-3 py-8 mb-6">
                <BlogPostForm />
              </div>
            )}

            <div className="bg-white shadow-md rounded-xl px-3 py-8 h-screen overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {postdata.map((blog, index) => (
                  <li
                    key={index}
                    className="py-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{blog.post_title}</p>
                      <p className="text-sm text-gray-500">
                        {blog.post_status} Comments • {blog.comment_status}{" "}
                        Views
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="text-blue-500 text-sm font-bold">
                        Edit
                      </button>
                      <button className="text-sm bg-red-500 px-2 py-1 text-white rounded-lg">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogManagement;
