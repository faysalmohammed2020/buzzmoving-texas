// "use client";
// import React, { useState, useEffect } from "react";
// import RichTextEditor from "./RichTextEditor";

// interface BlogPostFormProps {
//   initialData?: {
//     post_title: string;
//     post_content: string;
//     post_category?: string;
//     post_tags?: string;
//   } | null; // Allow null
//   onClose: () => void;
// }

// interface FormData {
//   title: string;
//   content: string;
//   category: string;
//   tags: string;
// }

// const BlogPostForm: React.FC<BlogPostFormProps> = ({
//   initialData,
//   onClose,
// }) => {
//   const [formData, setFormData] = useState<FormData>({
//     title: "",
//     content: "",
//     category: "",
//     tags: "",
//   });

//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         title: initialData.post_title || "",
//         content: initialData.post_content || "",
//         category: initialData.post_category || "",
//         tags: initialData.post_tags || "",
//       });
//     }
//   }, [initialData]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const formToSubmit = {
//       title: formData.title,
//       content: formData.content,
//       category: formData.category,
//       tags: formData.tags,
//     };

//     try {
//       const response = await fetch("/api/blogpost", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formToSubmit),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         alert("Blog post saved successfully!");
//         onClose(); // Close the form after submission
//       } else {
//         alert("Failed to save blog post. Please try again.");
//       }
//     } catch (error) {
//       alert("An unexpected error occurred. Please try again.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="p-6 space-y-6">
//       <div>
//         <label htmlFor="title" className="block text-lg font-medium mb-2">
//           Blog Title
//         </label>
//         <input
//           type="text"
//           id="title"
//           name="title"
//           value={formData.title}
//           onChange={handleChange}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//           placeholder="Enter blog title"
//           required
//         />
//       </div>

//       <div>
//         <label htmlFor="category" className="block text-lg font-medium mb-2">
//           Category
//         </label>
//         <input
//           type="text"
//           id="category"
//           name="category"
//           value={formData.category}
//           onChange={handleChange}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//           placeholder="Enter blog category"
//           required
//         />
//       </div>

//       <div>
//         <label htmlFor="tags" className="block text-lg font-medium mb-2">
//           Tags
//         </label>
//         <input
//           type="text"
//           id="tags"
//           name="tags"
//           value={formData.tags}
//           onChange={handleChange}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//           placeholder="Enter tags separated by commas"
//           required
//         />
//       </div>

//       <div>
//         <label htmlFor="content" className="block text-lg font-medium mb-2">
//           Blog Content
//         </label>
//         <RichTextEditor
//           value={formData.content}
//           onChange={(content) =>
//             setFormData((prev) => ({
//               ...prev,
//               content,
//             }))
//           }
//         />
//       </div>

//       <div className="text-right">
//         <button
//           type="submit"
//           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           {initialData ? "Update Blog" : "Publish Blog"}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default BlogPostForm;

"use client";
import React, { useState, useEffect } from "react";
import RichTextEditor from "./RichTextEditor";

// ✅ Use Partial<Blog> to handle both new and existing posts
interface BlogPostFormProps {
  initialData?: {
    id?: number;
    post_title: string;
    post_content: string;
    post_category?: string;
    post_tags?: string;
  } | null; // Allow null
  onClose: () => void;
  onUpdate: (updatedBlog: any) => void; // Pass updated data to the parent
}

interface FormData {
  id?: number;
  title: string;
  content: string;
  category: string;
  tags: string;
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
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || undefined,
        title: initialData.post_title || "",
        content: initialData.post_content || "",
        category: initialData.post_category || "",
        tags: initialData.post_tags || "",
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Handle form submission using `onSave`
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formToSubmit = {
      id: formData.id,
      title: formData.title,
      content: formData.content,
      category: formData.category,
      tags: formData.tags,
    };

    try {
      const response = await fetch("/api/blogpost", {
        method: formData.id ? "PUT" : "POST", // Use PUT for edits
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formToSubmit),
      });

      const result = await response.json();

      if (response.ok) {
        alert(
          formData.id ? "Blog updated successfully!" : "Blog post created!"
        );
        onUpdate(result); // Pass the updated data to parent
        onClose();
      } else {
        alert("Failed to save blog post. Please try again.");
      }
    } catch (error) {
      alert("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* ✅ Blog Title */}
      <div>
        <label htmlFor="post_title" className="block text-lg font-medium mb-2">
          Blog Title
        </label>
        <input
          type="text"
          id="post_title"
          name="post_title"
          value={formData.post_title}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter blog title"
          required
        />
      </div>

      {/* ✅ Category */}
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

      {/* ✅ Tags */}
      <div>
        <label htmlFor="tags" className="block text-lg font-medium mb-2">
          Tags
        </label>
        <input
          type="text"
          id="tags"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          placeholder="Enter tags separated by commas"
          required
        />
      </div>

      {/* ✅ Blog Content */}
      <div>
        <label
          htmlFor="post_content"
          className="block text-lg font-medium mb-2"
        >
          Blog Content
        </label>
        <RichTextEditor
          value={formData.post_content ?? ""} // ✅ Ensure it's always a string
          onChange={(content) =>
            setFormData((prev) => ({
              ...prev,
              post_content: content,
            }))
          }
        />
      </div>

      {/* ✅ Submit Button */}
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

// "use client";
// import React, { useState, useEffect } from "react";
// import RichTextEditor from "./RichTextEditor";

// interface BlogPostFormProps {
//   initialData?: {
//     post_title: string;
//     post_content: string;
//     post_category?: string;
//     post_tags?: string;
//   } | null; // Allow null
//   onClose: () => void;
// }

// interface FormData {
//   title: string;
//   content: string;
//   category: string;
//   tags: string;
// }

// const BlogPostForm: React.FC<BlogPostFormProps> = ({
//   initialData,
//   onClose,
// }) => {
//   const [formData, setFormData] = useState<FormData>({
//     title: "",
//     content: "",
//     category: "",
//     tags: "",
//   });

//   useEffect(() => {
//     if (initialData) {
//       setFormData({
//         title: initialData.post_title || "",
//         content: initialData.post_content || "",
//         category: initialData.post_category || "",
//         tags: initialData.post_tags || "",
//       });
//     }
//   }, [initialData]);

//   const handleChange = (
//     e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
//   ) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     const formToSubmit = {
//       title: formData.title,
//       content: formData.content,
//       category: formData.category,
//       tags: formData.tags,
//     };

//     try {
//       const response = await fetch("/api/blogpost", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(formToSubmit),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         alert("Blog post saved successfully!");
//         onClose(); // Close the form after submission
//       } else {
//         alert("Failed to save blog post. Please try again.");
//       }
//     } catch (error) {
//       alert("An unexpected error occurred. Please try again.");
//     }
//   };

//   return (
//     <form onSubmit={handleSubmit} className="p-6 space-y-6">
//       <div>
//         <label htmlFor="title" className="block text-lg font-medium mb-2">
//           Blog Title
//         </label>
//         <input
//           type="text"
//           id="title"
//           name="title"
//           value={formData.title}
//           onChange={handleChange}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//           placeholder="Enter blog title"
//           required
//         />
//       </div>

//       <div>
//         <label htmlFor="category" className="block text-lg font-medium mb-2">
//           Category
//         </label>
//         <input
//           type="text"
//           id="category"
//           name="category"
//           value={formData.category}
//           onChange={handleChange}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//           placeholder="Enter blog category"
//           required
//         />
//       </div>

//       <div>
//         <label htmlFor="tags" className="block text-lg font-medium mb-2">
//           Tags
//         </label>
//         <input
//           type="text"
//           id="tags"
//           name="tags"
//           value={formData.tags}
//           onChange={handleChange}
//           className="w-full px-4 py-3 border border-gray-300 rounded-lg"
//           placeholder="Enter tags separated by commas"
//           required
//         />
//       </div>

//       <div>
//         <label htmlFor="content" className="block text-lg font-medium mb-2">
//           Blog Content
//         </label>
//         <RichTextEditor
//           value={formData.content}
//           onChange={(content) =>
//             setFormData((prev) => ({
//               ...prev,
//               content,
//             }))
//           }
//         />
//       </div>

//       <div className="text-right">
//         <button
//           type="submit"
//           className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//         >
//           {initialData ? "Update Blog" : "Publish Blog"}
//         </button>
//       </div>
//     </form>
//   );
// };

// export default BlogPostForm;
