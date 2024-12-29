"use client";

import { useParams } from "next/navigation";
import { postdata } from "@/app/data/postdata";

const BlogPost: React.FC = () => {
  const { id } = useParams();

  const post = postdata.find((post) => post.ID === id);

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
        <div className="relative w-full h-[400px] bg-gray-200 flex items-center justify-center">
          <h1 className="text-6xl md:text-5xl font-bold text-gray-700">
            {post.post_title}
          </h1>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            {post.post_title}
          </h2>
          <p className="text-gray-500 mb-4">
            Published on: {new Date(post.post_date).toLocaleDateString()}
          </p>
          <div
            className="text-gray-700 leading-relaxed text-lg"
            dangerouslySetInnerHTML={{ __html: post.post_content }}
          />
        </div>
      </div>
    </div>
  );
};

export default BlogPost;

// "use client";

// import { useParams } from "next/navigation";
// import { postdata } from "@/app/data/postdata";

// const BlogPost: React.FC = () => {
//   const { id } = useParams();

//   const post = postdata.find((post) => post.ID === id);

//   if (!post) {
//     return (
//       <p className="text-center mt-20 text-2xl text-gray-500">
//         No post found with the provided ID.
//       </p>
//     );
//   }

//   return (
//     <div className="mx-auto">
//       <div className="bg-white rounded-lg shadow-md mb-10">
//         <div className="relative w-full h-[400px] bg-gray-200 flex items-center justify-center">
//           <h1 className="text-4xl md:text-5xl font-bold text-gray-700">
//             {post.post_title}
//           </h1>
//         </div>

//         <div className="p-6">
//           <h2 className="text-2xl font-bold text-gray-800 mb-4">
//             {post.post_title}
//           </h2>
//           <p className="text-gray-500 mb-4">
//             Published on: {new Date(post.post_date).toLocaleDateString()}
//           </p>
//           <div
//             className="text-gray-700 leading-relaxed text-lg"
//             dangerouslySetInnerHTML={{ __html: post.post_content }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default BlogPost;
