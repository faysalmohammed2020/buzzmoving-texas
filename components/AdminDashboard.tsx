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
  Area
} from "recharts";
import axios from "axios";
import { 
  FaComments, 
  FaFileAlt, 
  FaEye, 
  FaChartLine, 
  FaEdit, 
  FaTrash, 
  FaGlobeAmericas,
  FaRegChartBar,
  FaUsers,
  FaBlog,
  FaArrowUp,
  FaArrowDown
} from "react-icons/fa";
import { 
  HiOutlineUserGroup, 
  HiOutlineChatAlt2, 
  HiOutlineShare 
} from "react-icons/hi";

interface Blog {
  id: number;
  post_title: string;
  post_status: string;
  comment_status: string;
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

        const transformedData: Blog[] = data.map((item: any) => ({
          id: item.id,
          post_title: item.title.rendered,
          post_status: item.status,
          comment_status: item.comment_status,
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

  const recentBlogs = blogs.slice(0, 5);

  const [submissions, setSubmissions] = useState([]);
  const [responses, setResponses] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [subRes, respRes] = await Promise.all([
        axios.get("/api/admin/leads/submissions"),
        axios.get("/api/admin/leads/responses"),
      ]);
      setSubmissions(subRes.data.slice(0, 5)); // Only show 5 recent submissions
      setResponses(respRes.data.slice(0, 5)); // Only show 5 recent responses
    };

    fetchData();
  }, []);

  // Mock data for engagement metrics
  const engagementData = [
    { metric: "Likes", value: "123,434", icon: <HiOutlineUserGroup className="text-xl text-blue-500" />, change: "+12.3%", isPositive: true },
    { metric: "Comments", value: "45,230", icon: <HiOutlineChatAlt2 className="text-xl text-green-500" />, change: "+8.2%", isPositive: true },
    { metric: "Shares", value: "28,125", icon: <HiOutlineShare className="text-xl text-purple-500" />, change: "-3.5%", isPositive: false },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Analytics Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          title="Total Visitors"
          value="45,450"
          trend={{ value: "+12.3%", isPositive: true }}
          icon={<FaEye className="text-xl text-blue-500" />}
          color="bg-blue-100"
        />
        <StatCard
          title="This Month"
          value="5,839"
          trend={{ value: "-11%", isPositive: false }}
          icon={<FaChartLine className="text-xl text-purple-500" />}
          color="bg-purple-100"
        />
        <StatCard
          title="Total Blogs"
          value={blogs.length}
          trend={{ value: "+5.2%", isPositive: true }}
          icon={<FaBlog className="text-xl text-green-500" />}
          color="bg-green-100"
        />
        <StatCard
          title="Total Submissions"
          value={totalLeads}
          trend={{ value: "+8.7%", isPositive: true }}
          icon={<FaFileAlt className="text-xl text-amber-500" />}
          color="bg-amber-100"
        />
      </section>

      {/* Charts Section */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Analytics Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FaRegChartBar className="text-indigo-500" /> Weekly Performance
            </h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={stats.dailyLeads.map((lead, index) => ({
                date: lead.date,
                leads: lead.count,
                responses: stats.dailyResponses[index]?.count || 0,
              }))}
              margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
            >
              <defs>
                <linearGradient id="leadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="responseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12, fill: "#6b7280" }} 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                allowDecimals={false} 
                tick={{ fontSize: 12, fill: "#6b7280" }} 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: "#fff", 
                  border: "none", 
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                }}
                labelStyle={{ color: "#374151", fontWeight: "bold" }}
                itemStyle={{ fontSize: "14px", color: "#4b5563" }}
              />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconType="circle"
                wrapperStyle={{ paddingBottom: "16px" }}
              />
              <Bar
                dataKey="leads"
                fill="url(#leadGradient)"
                radius={[4, 4, 0, 0]}
                name="Submissions"
                barSize={24}
              />
              <Area
                type="monotone"
                dataKey="responses"
                fill="url(#responseGradient)"
                stroke="#10b981"
                strokeWidth={2}
                name="Responses"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Engagement Metrics & Visitor Map */}
        <div className="flex flex-col gap-6">
          {/* Engagement Metrics Card */}
          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaUsers className="text-indigo-500" /> Engagement Metrics
            </h3>
            <div className="space-y-4">
              {engagementData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100">
                      {item.icon}
                    </div>
                    <div>
                      <span className="text-gray-600 block">{item.metric}</span>
                      <span className="text-xs text-gray-400">Social media</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-gray-800 block">{item.value}</span>
                    <span className={`text-xs flex items-center justify-end ${item.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                      {item.isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                      {item.change}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Visitor Map */}
          <div className="bg-white p-5 rounded-xl shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <FaGlobeAmericas className="text-indigo-500" /> Visitor Distribution
            </h2>
            <div className="h-48 flex items-center justify-center">
              <VisitorMarquee />
            </div>
          </div>
        </div>
      </section>

      {/* Tables Section - Side by Side */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Submissions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Lead Submissions</h2>
            <span className="text-xs bg-blue-100 text-blue-800 py-1 px-2 rounded-full">{submissions.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">Email</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.length > 0 ? (
                  submissions.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">
                        {lead.firstName} {lead.lastName}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">{lead.email || "—"}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        {new Date(lead.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                      No recent submissions
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all submissions →
            </button>
          </div>
        </div>

        {/* Responses Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Lead Responses</h2>
            <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">{responses.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3 text-left">Lead ID</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {responses.length > 0 ? (
                  responses.map((leadId, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap">#{leadId}</td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Responded</span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">—</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-gray-500">
                      No recent responses
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 text-right">
            <button className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">
              View all responses →
            </button>
          </div>
        </div>
      </section>

      {/* Recent Blogs Section */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Recent Blog Posts</h2>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors">
              Add New Post
            </button>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6 text-center text-gray-600">Loading blogs...</div>
            ) : error ? (
              <div className="p-6 text-center text-red-500">{error}</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Title</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Comments</th>
                    <th className="px-5 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-medium text-gray-900 line-clamp-1">{blog.post_title}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          blog.post_status === "publish" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {blog.post_status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          blog.comment_status === "open" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {blog.comment_status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditClick(blog)}
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(blog.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </section>

      {/* Edit Blog Modal */}
      {isEditModalVisible && editBlogData && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={handleEditClose}
        >
          <div
            className="bg-white rounded-xl w-full max-w-2xl shadow-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">Edit Blog Post</h2>
              <button
                onClick={handleEditClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post Title</label>
                  <input
                    type="text"
                    value={editBlogData.post_title}
                    onChange={(e) =>
                      setEditBlogData({
                        ...editBlogData,
                        post_title: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Post Title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Post Status</label>
                  <select
                    value={editBlogData.post_status}
                    onChange={(e) =>
                      setEditBlogData({
                        ...editBlogData,
                        post_status: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="publish">Published</option>
                    <option value="draft">Draft</option>
                    <option value="pending">Pending Review</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Comment Status</label>
                  <select
                    value={editBlogData.comment_status}
                    onChange={(e) =>
                      setEditBlogData({
                        ...editBlogData,
                        comment_status: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-5 border-t border-gray-200">
              <button
                onClick={handleEditClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleEditSave(editBlogData)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, trend, icon, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        {trend && (
          <span className={`text-xs font-medium mt-1 flex items-center ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
            {trend.value}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

export default AdminDashboard;