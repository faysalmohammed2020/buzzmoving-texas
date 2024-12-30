"use client";
import React, { useState, useEffect } from "react";
import VisitorMarquee from "./VisitorMarquee";

interface Blog {
  id: number;
  post_title: string;
  post_status: string; // Example: "Published" or "Draft"
  comment_status: string; // Example: "Open" or "Closed"
}

const AdminDashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);

  // Fetch blogs from the API
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://movingquotetexas.com/wp-json/wp/v2/posts?per_page=100",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        // Transform the API data to match the Blog structure
        const transformedData: Blog[] = data.map((item: any) => ({
          id: item.id,
          post_title: item.title.rendered,
          post_status: item.status, // Assuming "status" exists in the API
          comment_status: item.comment_status, // Assuming "comment_status" exists
        }));

        setBlogs(transformedData);
      } catch (err) {
        setError("Failed to fetch blogs. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const handleDeleteClick = (id: number) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    }
  };

  const handleEditClick = (blog: Blog) => {
    setEditBlogData(blog);
    setIsEditModalVisible(true);
  };

  const handleEditClose = () => {
    setIsEditModalVisible(false);
    setEditBlogData(null);
  };

  const handleEditSave = (updatedBlog: Blog) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog.id === updatedBlog.id ? { ...blog, ...updatedBlog } : blog
      )
    );
    setIsEditModalVisible(false);
    setEditBlogData(null);
  };

  const recentBlogs = blogs.slice(0, 10); // Display only the most recent 10 blogs

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-xl font-bold">Total Visitors</h3>
          <div className="text-2xl ml-2 font-bold mt-4">45,450</div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">This Month</h3>
          <h2 className="text-2xl font-bold mt-2 ml-2">5,839</h2>
          <span className="text-red-500 text-sm">-11% last week</span>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">Total Blogs</h3>
          <h3 className="text-2xl font-bold mt-2 ml-2">{blogs.length}</h3>
        </div>
        <div className="bg-white shadow-md rounded-xl py-4 px-8 flex flex-col">
          <div className="flex justify-between">
            <h3 className="text-gray-700 font-bold">Likes:</h3>
            <h2 className="font-bold">123,434</h2>
          </div>
          <div className="flex justify-between">
            <h3 className="text-gray-700 font-bold">Comments:</h3>
            <h2 className="font-bold">123,434</h2>
          </div>
          <div className="flex justify-between">
            <h3 className="text-gray-700 font-bold">Share:</h3>
            <h2 className="font-bold">123,434</h2>
          </div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Worldwide Visitors</h2>
            <div className="bg-white shadow-md rounded-xl p-4 h-96 flex items-center justify-center">
              <VisitorMarquee />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Recent Blogs</h2>
            <div className="bg-white shadow-md rounded-xl px-3 py-8 h-96 overflow-y-auto">
              {isLoading ? (
                <p className="text-center text-gray-600">Loading blogs...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {recentBlogs.map((blog) => (
                    <li
                      key={blog.id}
                      className="py-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{blog.post_title}</p>
                        <p className="text-sm text-gray-500">
                          {blog.post_status} • {blog.comment_status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(blog)}
                          className="text-blue-500 text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(blog.id)}
                          className="text-sm bg-red-500 px-2 py-1 text-white rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Edit Blog Modal */}
      {isEditModalVisible && editBlogData && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={handleEditClose}
        >
          <div
            className="bg-white rounded-xl p-8 w-11/12 max-w-4xl shadow-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-2">
              <h2 className="text-2xl font-bold">Edit Blog</h2>
              <button
                onClick={handleEditClose}
                className="text-gray-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            <div>
              <input
                type="text"
                value={editBlogData.post_title}
                onChange={(e) =>
                  setEditBlogData({
                    ...editBlogData,
                    post_title: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Post Title"
              />
              <textarea
                value={editBlogData.post_status}
                onChange={(e) =>
                  setEditBlogData({
                    ...editBlogData,
                    post_status: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Post Status"
              />
              <textarea
                value={editBlogData.comment_status}
                onChange={(e) =>
                  setEditBlogData({
                    ...editBlogData,
                    comment_status: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Comment Status"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleEditClose}
                  className="text-gray-500 font-bold px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditSave(editBlogData)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
