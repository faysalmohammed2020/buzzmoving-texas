"use client";
import React, { useState, useEffect } from "react";
import { FiUploadCloud, FiTrash2 } from "react-icons/fi"; // Import icons

interface BlogPostFormProps {
  initialData?: any; // Data for editing a blog
  onClose: () => void; // Callback to close the modal
}

const BlogPostForm: React.FC<BlogPostFormProps> = ({
  initialData,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: null as File | null,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.post_title || "",
        content: initialData.post_content || "",
        image: null, // Handle image differently if needed
      });
    }
  }, [initialData]);

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

  const handleRemoveImage = () => {
    setFormData({ ...formData, image: null });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onClose(); // Close modal after submission
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
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

      <div className="mb-6">
        <label htmlFor="content" className="block text-lg font-medium mb-2">
          Blog Content
        </label>
        <textarea
          id="content"
          name="content"
          value={formData.content}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Write your blog content here"
          rows={6}
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="image" className="block text-lg font-medium mb-2">
          Upload Blog Image
        </label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 bg-gray-50 hover:bg-gray-100 cursor-pointer text-center">
          <label htmlFor="file-input" className="block">
            <div className="flex flex-col items-center">
              <FiUploadCloud className="text-blue-500 w-12 h-12 mb-4" />
              <p className="text-gray-700">
                Drag and Drop file here or{" "}
                <span className="text-blue-500 font-semibold cursor-pointer">
                  Choose file
                </span>
              </p>
            </div>
          </label>
          <input
            id="file-input"
            type="file"
            name="image"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        {formData.image && (
          <div className="mt-4 flex items-center gap-4 px-4 py-2 rounded-lg">
            <p className="text-gray-800 font-medium">
              Selected file: <span className="text-green-600">{formData.image.name}</span>
            </p>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="flex items-center text-red-600 rounded-lg font-bold"
            >
              <FiTrash2 className="size-5"/>
            </button>
          </div>
        )}

        
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold"
        >
          {initialData ? "Update Blog" : "Publish Blog"}
        </button>
      </div>
    </form>
  );
};

export default BlogPostForm;
