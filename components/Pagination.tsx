"use client";

import React, { useState } from "react";
import ReactPaginate from "react-paginate";
import BlogCard from "./BlogCard";

export interface Blog {
  id: number;
  post_title: string;
  post_content: string;
  category: string;
  tags: string;
  createdAt: string;
}

type PaginatedItemsProps = {
  blogs: Blog[];
  itemsPerPage: number;
  onEdit: (blog: Blog) => void;
  onDelete: (id: number) => void;
};

const PaginatedItems: React.FC<PaginatedItemsProps> = ({
  blogs,
  itemsPerPage,
  onEdit,
  onDelete,
}) => {
  const [itemOffset, setItemOffset] = useState<number>(0);

  const endOffset = itemOffset + itemsPerPage;
  const currentItems = blogs.slice(itemOffset, endOffset);
  const pageCount = Math.ceil(blogs.length / itemsPerPage);

  const handlePageClick = (event: { selected: number }) => {
    const newOffset = (event.selected * itemsPerPage) % blogs.length;
    setItemOffset(newOffset);
  };

  return (
    <div className="p-6 font-sans">
      {/* Render the current blogs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {currentItems.map((blog) => (
          <BlogCard
            key={blog.id}
            blog={blog}
            onEdit={() => onEdit(blog)}
            onDelete={() => onDelete(blog.id)}
          />
        ))}
      </div>

      {/* Render the pagination controls */}
      <ReactPaginate
        breakLabel="..."
        nextLabel="Next"
        previousLabel="Previous"
        onPageChange={handlePageClick}
        pageRangeDisplayed={3}
        pageCount={pageCount}
        renderOnZeroPageCount={null}
        containerClassName="flex justify-center items-center mt-4 gap-2"
        pageClassName="flex"
        pageLinkClassName="px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded shadow hover:bg-gray-200"
        activeClassName="flex"
        activeLinkClassName="bg-gray-300 font-bold"
        previousLinkClassName="px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded shadow hover:bg-gray-200"
        nextLinkClassName="px-4 py-2 text-gray-800 bg-white border border-gray-300 rounded shadow hover:bg-gray-200"
        disabledClassName="opacity-50 cursor-not-allowed"
      />
    </div>
  );
};

export default PaginatedItems;
