"use client";
import React, { useState } from "react";

const BlogPostForm: React.FC = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null as File | null, // To store the image file
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form Data:", formData);
    // Handle form submission here, including image upload if needed
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 bg-white shadow-lg rounded-xl">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">
        Create New Blog
      </h2>
      <form onSubmit={handleSubmit}>
        {/* Title */}
        <div className="mb-6">
          <label
            htmlFor="title"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Blog Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Enter blog title"
            required
          />
        </div>

        {/* Content */}
        <div className="mb-6">
          <label
            htmlFor="content"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Blog Content
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Write your blog content here"
            rows={6}
            required
          />
        </div>

        {/* Image Upload */}
        <div className="mb-6">
          <label
            htmlFor="image"
            className="block text-lg font-medium text-gray-700 mb-2"
          >
            Upload Blog Image
          </label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-4 border border-dashed border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {formData.image && (
            <div className="mt-4">
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Selected Preview"
                className="max-w-xs rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="text-right">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:outline-none transition duration-200"
          >
            Publish Blog
          </button>
        </div>
      </form>
    </div>
  );
};

export default BlogPostForm;
