"use client";
import React, { useState, useEffect } from "react";
import VisitorMarquee from "./VisitorMarquee";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  ComposedChart,
  Legend,
  Line,
} from "recharts";
import axios from "axios";
import { FaComments, FaFileAlt } from "react-icons/fa";
interface Blog {
  id: number;
  post_title: string;
  post_status: string; // Example: "Published" or "Draft"
  comment_status: string; // Example: "Open" or "Closed"
}

const AdminDashboard: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [editBlogData, setEditBlogData] = useState<Blog | null>(null);
  const [stats, setStats] = useState({ dailyLeads: [], dailyResponses: [] });
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalResponses, setTotalResponses] = useState(0);
  // Fetch blogs from the API
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          "https://movingquotetexas.com/wp-json/wp/v2/posts?per_page=100",
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();

        // Transform the API data to match the Blog structure
        const transformedData: Blog[] = data.map((item: any) => ({
          id: item.id,
          post_title: item.title.rendered,
          post_status: item.status, // Assuming "status" exists in the API
          comment_status: item.comment_status, // Assuming "comment_status" exists
        }));

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
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/leads/stats");
        const data = await res.json();
        setStats({ dailyLeads: data.dailyLeads, dailyResponses: data.dailyResponses });
        setTotalLeads(data.totalLeads);
        setTotalResponses(data.totalResponses);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      }
    };
    fetchStats();
  }, []);

  const handleDeleteClick = (id: number) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      setBlogs((prevBlogs) => prevBlogs.filter((blog) => blog.id !== id));
    }
  };

  const handleEditClick = (blog: Blog) => {
    setEditBlogData(blog);
    setIsEditModalVisible(true);
  };

  const handleEditClose = () => {
    setIsEditModalVisible(false);
    setEditBlogData(null);
  };

  const handleEditSave = (updatedBlog: Blog) => {
    setBlogs((prevBlogs) =>
      prevBlogs.map((blog) =>
        blog.id === updatedBlog.id ? { ...blog, ...updatedBlog } : blog
      )
    );
    setIsEditModalVisible(false);
    setEditBlogData(null);
  };

  const recentBlogs = blogs.slice(0, 10); // Display only the most recent 10 blogs

  const [submissions, setSubmissions] = useState([]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [subRes, respRes] = await Promise.all([
        axios.get("/api/admin/leads/submissions"),
        axios.get("/api/admin/leads/responses"),
      ]);
      setSubmissions(subRes.data);
      setResponses(respRes.data);
    };

    fetchData();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-xl font-bold">Total Visitors</h3>
          <div className="text-2xl ml-2 font-bold mt-4">45,450</div>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">This Month</h3>
          <h2 className="text-2xl font-bold mt-2 ml-2">5,839</h2>
          <span className="text-red-500 text-sm">-11% last week</span>
        </div>
        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-gray-700 text-lg font-bold">Total Blogs</h3>
          <h3 className="text-2xl font-bold mt-2 ml-2">{blogs.length}</h3>
        </div>
        <StatCard
          title="Total Submission"
          value={totalLeads}
          icon={<FaFileAlt className="text-green-500 text-xl" />} color="text-green-500"
        />
        <StatCard
          title="Total Responses"
          value={totalResponses}
          icon={<FaComments className="text-yellow-500 text-xl" />} color="text-yellow-500"
        />
        <div className="bg-white shadow-md rounded-xl py-4 px-8 flex flex-col">
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


      <div className="space-y-12">
        {/* Submissions Table */}
        <div>
          <h2 className="text-xl font-semibold">Lead Submissions</h2>
          <table className="min-w-full table-auto border mt-4">
            <thead className="bg-gray-100 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-3">Name</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">IP</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((lead) => (
                <tr key={lead.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    {lead.firstName} {lead.lastName}
                  </td>
                  <td className="px-6 py-4">{lead.email || "—"}</td>
                  <td className="px-6 py-4">{lead.phone || "—"}</td>
                  <td className="px-6 py-4">{lead.fromIp || "—"}</td>
                  <td className="px-6 py-4">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Responses Table */}
        <div>
          <h2 className="text-xl font-semibold ">Leads with Responses</h2>
          <table className="min-w-full table-auto border mt-4 mb-10">
            <thead className="bg-green-100 text-xs uppercase text-green-700">
              <tr>
                <th className="px-6 py-3">Lead ID</th>
                <th className="px-6 py-3">Response</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Phone</th>
                <th className="px-6 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {responses.map((leadId, index) => (
                <tr key={index} className="border-b hover:bg-green-50">
                  <td className="px-6 py-4">{leadId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>








      <div className="col-span-1 lg:col-span-2">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span>📊</span> Weekly Insights
          </h2>
          <ResponsiveContainer width="100%" height={360}>
            <ComposedChart
              data={stats.dailyLeads.map((lead, index) => ({
                date: lead.date,
                leads: lead.count,
                responses: stats.dailyResponses[index]?.count || 0,
              }))}
              margin={{ top: 20, right: 20, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="4 4" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#6b7280" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7280" }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#fff", borderColor: "#ddd", borderRadius: "8px" }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
                itemStyle={{ fontSize: "14px", color: "#4b5563" }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar
                dataKey="leads"
                fill="url(#leadGradient)"
                radius={[6, 6, 0, 0]}
                name="Submission"
                barSize={28}
              />
              <Line
                type="monotone"
                dataKey="responses"
                stroke="#16a34a"
                strokeWidth={3}
                dot={{ r: 5, strokeWidth: 2, fill: "#16a34a" }}
                name="Responses"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Recent Blogs Section */}
      <section className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-4">Worldwide Visitors</h2>
            <div className="bg-white shadow-md rounded-xl p-4 h-96 flex items-center justify-center">
              <VisitorMarquee />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-4">Our Recent Blogs</h2>
            <div className="bg-white shadow-md rounded-xl px-3 py-8 h-96 overflow-y-auto">
              {isLoading ? (
                <p className="text-center text-gray-600">Loading blogs...</p>
              ) : error ? (
                <p className="text-center text-red-500">{error}</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {recentBlogs.map((blog) => (
                    <li
                      key={blog.id}
                      className="py-4 flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">{blog.post_title}</p>
                        <p className="text-sm text-gray-500">
                          {blog.post_status} • {blog.comment_status}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(blog)}
                          className="text-blue-500 text-sm font-bold"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(blog.id)}
                          className="text-sm bg-red-500 px-2 py-1 text-white rounded-lg"
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Edit Blog Modal */}
      {isEditModalVisible && editBlogData && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-70 flex justify-center items-center z-50"
          role="dialog"
          aria-modal="true"
          onClick={handleEditClose}
        >
          <div
            className="bg-white rounded-xl p-8 w-11/12 max-w-4xl shadow-lg overflow-y-auto max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between mb-2">
              <h2 className="text-2xl font-bold">Edit Blog</h2>
              <button
                onClick={handleEditClose}
                className="text-gray-500 font-bold text-xl"
              >
                &times;
              </button>
            </div>
            <div>
              <input
                type="text"
                value={editBlogData.post_title}
                onChange={(e) =>
                  setEditBlogData({
                    ...editBlogData,
                    post_title: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Post Title"
              />
              <textarea
                value={editBlogData.post_status}
                onChange={(e) =>
                  setEditBlogData({
                    ...editBlogData,
                    post_status: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Post Status"
              />
              <textarea
                value={editBlogData.comment_status}
                onChange={(e) =>
                  setEditBlogData({
                    ...editBlogData,
                    comment_status: e.target.value,
                  })
                }
                className="w-full p-2 border border-gray-300 rounded mb-4"
                placeholder="Comment Status"
              />
              <div className="flex justify-end gap-4">
                <button
                  onClick={handleEditClose}
                  className="text-gray-500 font-bold px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleEditSave(editBlogData)}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


const StatCard = ({ title, value, icon, color }) => (
<div className="bg-gradient-to-br from-white to-gray-50 p-5 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
<div className="flex items-center space-x-4">
<div className={`p-3 rounded-full ${color} bg-opacity-10`}>{icon}</div>
<div>
<h4 className="text-sm font-medium text-gray-500">{title}</h4>
<p className="text-xl font-semibold text-gray-800">{value}</p>
</div>
</div>
</div>
);

export default AdminDashboard;
