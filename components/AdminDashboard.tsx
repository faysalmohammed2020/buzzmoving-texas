import React from "react";
import { postdata } from "@/app/data/postdata";

const AdminDashboard: React.FC = () => {
  const blogs = postdata.slice(0, 10);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
     
      {/* Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Team Payments */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-xl font-bold">Total Visitors</h3>
          <div className="flex mt-4 items-center">
            <div className="text-2xl ml-2 font-bold">45,450</div>
          </div>
        </div>

        {/* Savings */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">This Month</h3>
          <h2 className="text-2xl font-bold mt-2 ml-2">5,839</h2>
          <span className="text-red-500 text-sm">-11% last week</span>
        </div>

        {/* Income Statistics */}
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">Total Blogs</h3>
          <h3 className="text-2xl mt-2 ml-2 font-bold">{postdata.length}</h3>
        </div>

        {/* Plan Upgrade */}
        <div className="bg-white shadow-md rounded-xl py-4 px-8 flex flex-col justify-between">
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

      {/* Recently Payments */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Worldwide Visitors</h2>
            <div className="bg-white shadow-md rounded-xl p-4 h-96 flex items-center justify-center">
              <h3 className="text-center">Here our visitors map will show</h3>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Our Recent Blogs</h2>
            <div className="bg-white shadow-md rounded-xl px-3 py-8 h-96 overflow-y-auto">
              <ul className="divide-y divide-gray-200">
                {blogs.map((blog, index) => (
                  <li
                    key={index}
                    className="py-4 flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">{blog.post_title}</p>
                      <p className="text-sm text-gray-500">
                        {blog.post_status} Comments • {blog.comment_status}{" "}
                        Views
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button className="text-blue-500 text-sm font-bold">
                        Edit
                      </button>
                      <button className="text-sm bg-red-500 px-2 py-1 text-white rounded-lg">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
