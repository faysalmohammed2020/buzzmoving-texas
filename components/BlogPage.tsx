"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";

interface Blog {
  id: number;
  post_title: string;
  post_content: string;
  post_category: string;
  post_tags: string;
  createdAt: any;
}

const extractFirstImage = (htmlContent: string): string | null => {
  if (typeof window !== "undefined") {
    const imgElement = new DOMParser()
      .parseFromString(htmlContent, "text/html")
      .querySelector("img");
    return imgElement
      ? imgElement.getAttribute("src")
      : "https://via.placeholder.com/400x200.png?text=No+Image";
  }
  return null;
};

const BlogPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string | null }>(
    {}
  );

  // Pagination States
  const [currentPage, setCurrentPage] = useState<number>(1);
  const postsPerPage = 6; // Number of blogs per page

  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("/api/blogfetch");
        const data = await response.json();

        console.log("Raw API Response:", data);

        const transformedData: Blog[] = data.map((item: any) => ({
          id: item.id,
          post_title: item.post_title,
          post_content:
            typeof item.post_content === "object" && item.post_content.text
              ? item.post_content.text
              : String(item.post_content),
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

  useEffect(() => {
    const images: { [key: string]: string | null } = {};
    blogs.forEach((post) => {
      images[post.id] = extractFirstImage(post.post_content);
    });
    setImageUrls(images);
  }, [blogs]);

  // Pagination Logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = blogs.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(blogs.length / postsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Generate Page Numbers with "..." when needed
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 3;

    if (totalPages <= 6) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    if (currentPage <= maxVisiblePages) {
      pages.push(1, 2, 3, "...", totalPages - 2, totalPages - 1, totalPages);
    } else if (currentPage > totalPages - maxVisiblePages) {
      pages.push(1, 2, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages
      );
    }

    return pages;
  };

  return (
    <div className="container mx-auto mt-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Blog</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentPosts.map((post: Blog) => {
          const imageUrl = imageUrls[post.id];
          return (
            <div key={post.id} className="bg-white rounded-xl shadow-md p-4">
              {imageUrl && (
                <Image
                  src={imageUrl}
                  alt={post.post_title}
                  width={600}
                  height={200}
                  layout="intrinsic"
                  className="object-cover rounded-md mb-4"
                />
              )}
              <h2 className="text-2xl font-semibold mb-2">{post.post_title}</h2>
              <p className="text-gray-500 text-sm mb-4">
                Published on: {new Date(post.createdAt).toLocaleDateString()}
              </p>
              <div
                className="text-gray-700 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{
                  __html: post.post_content.slice(0, 200) + "...",
                }}
              />
              <Link
                href={`/blog/${post.id}`}
                className="px-4 py-2 mt-4 inline-block text-sm rounded-[5px] font-medium text-white bg-blue-600 shadow hover:bg-blue-800 transition duration-300"
              >
                Read more
              </Link>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center p-6 ">
          <ul className="flex space-x-2 items-center">
            {/* Previous Button */}
            <li>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-2 border rounded-md ${
                  currentPage === 1
                    ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                    : "text-black hover:bg-gray-300"
                }`}
              >
                Previous
              </button>
            </li>

            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => (
              <li key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2">...</span>
                ) : (
                  <button
                    onClick={() => paginate(Number(page))}
                    className={`px-3 py-2 border rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "text-black hover:bg-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )}
              </li>
            ))}

            {/* Next Button */}
            <li>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-2 border rounded-md ${
                  currentPage === totalPages
                    ? "text-gray-400 bg-gray-200 cursor-not-allowed"
                    : "text-black hover:bg-gray-300"
                }`}
              >
                Next
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default dynamic(() => Promise.resolve(BlogPage), { ssr: false });
