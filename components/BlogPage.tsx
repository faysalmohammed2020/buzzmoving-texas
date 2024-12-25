"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { postdata } from "@/app/data/postdata";
import Image from "next/image";
import dynamic from "next/dynamic";

interface Post {
  ID: string;
  post_author: string;
  post_date: string;
  post_date_gmt: string;
  post_content: string;
  post_title: string;
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
  const [imageUrls, setImageUrls] = useState<{ [key: string]: string | null }>(
    {}
  );

  useEffect(() => {
    const images: { [key: string]: string | null } = {};
    postdata.forEach((post) => {
      images[post.ID] = extractFirstImage(post.post_content);
    });
    setImageUrls(images);
  }, []); // This will only run on the client side

  return (
    <div className="container mx-auto mt-12 px-4">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Blog</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {postdata.map((post: Post) => {
          const imageUrl = imageUrls[post.ID];
          return (
            <div key={post.ID} className="bg-white rounded-xl shadow-md p-4">
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
                Published on: {new Date(post.post_date).toLocaleDateString()}
              </p>
              <div
                className="text-gray-700 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{
                  __html: post.post_content.slice(0, 200) + "...",
                }}
              />
              <Link
                href={`/blog/${post.ID}`}
                className="px-4 py-2 mt-4 inline-block text-sm rounded-[5px] font-medium text-white bg-blue-600 shadow hover:bg-blue-800 transition duration-300"
              >
                Read more
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// export default BlogPage;
export default dynamic(() => Promise.resolve(BlogPage), { ssr: false });
