import React from "react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import { postdata } from "@/app/data/postdata";
import { placeData } from "@/app/data/placeData";

const Categories = () => {
  return (
    <div className="container mx-auto mt-12 px-28">
      <h2 className="text-4xl font-bold text-center text-blue-900 mb-8">
        State Categories
      </h2>

      <Accordion
        type="single"
        collapsible
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
      >
        {placeData.map((item) => (
          <AccordionItem
            key={item.id}
            value={`item-${item.id}`}
            className="border-b border-gray-300 pb-2"
          >
            <AccordionTrigger className="flex justify-between items-center text-blue-900 text-lg font-semibold">
              {item.name}
            </AccordionTrigger>
            <AccordionContent className="text-md text-gray-700 mt-2">
              <ul className="list-none space-y-2">
                {postdata
                  .filter((post) => post.category?.id === item.id)
                  .map((post) => (
                    <li
                      key={post.ID}
                      className="text-slate-800 hover:text-blue-600 hover:font-bold hover:underline"
                    >
                      <a href={`/blog/${post.ID}`}>{post.post_title}</a>
                    </li>
                  ))}
                {postdata.filter((post) => post.category?.id === item.id)
                  .length === 0 && (
                  <li className="text-gray-500">
                    No posts available for this category.
                  </li>
                )}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default Categories;
