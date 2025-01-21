"use client";

import { useParams } from "next/navigation";
import { postdata } from "@/app/data/postdata";
import { useEffect, useState } from "react";

interface Blog {
  content: string | TrustedHTML;
  createdAt: string | number | Date;
  id: number;
  title: string;
}

const BlogPost: React.FC = () => {
  const { id } = useParams();
  const [blogs, setBlogs] = useState<Blog[]>([]); // State to store blogs

  useEffect(() => {
    // Fetch blog data from the API
    const fetchBlogs = async () => {
      try {
        const response = await fetch("/api/blogfetch");
        if (!response.ok) {
          throw new Error("Failed to fetch blog data");
        }
        const data = await response.json();
        console.log("data", data);
        setBlogs(data); // Update state with fetched blog data
      } catch (error) {
        console.error("Error fetching blogs:", error);
      }
    };

    fetchBlogs(); // Fetch data when the component mounts
  }, []);

  const postId = Number(id);
  const post = blogs.find((post) => post.id === postId);

  console.log("User Post:", post);

  if (!post) {
    return (
      <p className="text-center mt-20 text-2xl p-80 text-gray-500">
        No post found with the provided ID. Abar Code Kor
      </p>
    );
  }

  return (
    <div className="mx-auto">
      <div className="bg-white rounded-lg shadow-md mb-10">
        <div className="relative w-full bg-gray-200 flex items-center justify-center">
          <h1 className="text-6xl py-4 md:text-5xl font-bold text-gray-700">
            {post.title}
          </h1>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {post.title}
          </h2>
          <p className="text-gray-500 mb-4">
            Published on: {new Date(post.createdAt).toLocaleDateString()}
          </p>
          <div
            className="text-gray-700 leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
