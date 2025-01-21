"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { VscAccount } from "react-icons/vsc";
import Image from "next/image";

interface Blog {
  id: number;
  post_title: string;
}

const HeaderMenu: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [blogs, setBlogs] = useState<Blog[]>([]); // State to store blogs
  const [searchQuery, setSearchQuery] = useState<string>(""); // Search query state

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

  const filteredBlogs = blogs.filter((blog) =>
    blog.post_title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Highlight the search term in blog titles
  const highlightSearchTerm = (text: string, query: string): string => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(
      regex,
      (match) => `<span style="color: blue;">${match}</span>`
    );
  };

  const handleMouseEnter = (menuName: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setHoveredMenu(menuName);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 300);
  };

  return (
    <header className="bg-[#191C27] shadow-md border-b border-gray-300 sticky top-0 left-0 w-full z-50">
      <nav className="container mx-auto flex items-center justify-between py-4 px-6 text-white">
        <div className="flex items-center space-x-4">
          <Image
            src="/image/logo.png"
            alt="Company Logo"
            width={386}
            height={59}
          />
        </div>

        <div className="md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        <ul className="hidden md:flex items-center space-x-10 font-semibold text-lg">
          <li>
            <Link href="/home">Home</Link>
          </li>

          <li
            className="group relative"
            onMouseEnter={() => handleMouseEnter("services")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center cursor-pointer">
              <span>Services</span>
              <ChevronDown className="ml-2 w-4 h-4 text-white" />
            </div>

            {hoveredMenu === "services" && (
              <div className="absolute left-0 mt-5 w-96 bg-white text-black shadow-lg rounded-xl p-6">
                <div className="flex">
                  <div className="w-1/3">
                    <Image
                      src="/image/delevery2.jpg"
                      alt="Best Services"
                      height={100}
                      width={100}
                      className="rounded-md mb-4"
                    />
                    <h4 className="text-lg font-bold">Best Service</h4>
                    <p className="text-sm text-gray-600">
                      Explore our top-rated services tailored to meet your
                      needs.
                    </p>
                  </div>

                  <div className="w-2/3 gap-4 pl-6">
                    <div>
                      <div className="py-2">
                        <h5 className="text-lg font-bold mb-2">Our Services</h5>
                        <hr />
                      </div>

                      <ul className="space-y-1 text-md">
                        <li>
                          <Link
                            href="/services/long-distance-moving"
                            className="text-gray-700 hover:text-blue-500"
                          >
                            Long Distance Moving
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/services/auto-transport"
                            className="text-gray-700 hover:text-blue-500"
                          >
                            Auto Transport
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/services/storage-solutions"
                            className="text-gray-700 hover:text-blue-500"
                          >
                            Storage Solutions
                          </Link>
                        </li>
                        <li>
                          <Link
                            href="/services/home-changes"
                            className="text-gray-700 hover:text-blue-500"
                          >
                            Home Changes
                          </Link>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </li>

          <li
            className="group relative"
            onMouseEnter={() => handleMouseEnter("about")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center cursor-pointer">
              <span>About Us</span>
              <ChevronDown className="ml-2 w-4 h-4 text-white" />
            </div>
            {hoveredMenu === "about" && (
              <ul className="absolute left-0 mt-2 w-48 bg-white text-black shadow-lg rounded-xl opacity-100">
                <li className="px-4 py-2 hover:text-blue-600">
                  <Link href="/about-us/testimonial">Testimonials</Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link href="/contact">Contact</Link>
          </li>

          <li
            className="group relative"
            onMouseEnter={() => handleMouseEnter("blogs")}
            onMouseLeave={handleMouseLeave}
          >
            <div className="flex items-center cursor-pointer">
              <span>Blog</span>
              <ChevronDown className="ml-2 w-4 h-4 text-white" />
            </div>

            {hoveredMenu === "blogs" && (
              <div className="absolute -left-32 mt-5 w-[450px] bg-white text-black shadow-lg rounded-xl p-4">
                <div className="flex">
                  <div className={`w-1/3 ${isHovered ? "hidden" : "block"}`}>
                    <Image
                      src="/image/delevery4.jpg"
                      alt="Explore Blogs"
                      height={120}
                      width={120}
                      className="rounded-md mb-4"
                    />
                    <h4 className="text-lg font-bold">Explore Blogs</h4>
                    <p className="text-gray-600">
                      Discover insights, tips, and stories on a variety of
                      topics.
                    </p>
                  </div>

                  <div
                    className={`${
                      isHovered ? "w-full" : "w-2/3"
                    } gap-4 pl-6 overflow-y-auto h-96`}
                  >
                    <div
                      onMouseEnter={() => setIsHovered(true)}
                      onMouseLeave={() => setIsHovered(false)}
                    >
                      <div>
                        <input
                          type="text"
                          placeholder="Search blogs..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-2 py-1 pl-12 rounded-xl bg-white text-black placeholder-gray-600 focus:outline-none focus:ring-orange-500 shadow-sm border border-orange-600 transition-all duration-300"
                        />
                        <hr />
                      </div>

                      <ul className="space-y-3">
                        <div className="scrollbar mt-4 space-y-4 ">
                          {filteredBlogs.length > 0 ? (
                            filteredBlogs.map((blog) => (
                              <li
                                key={blog.id}
                                className="group p-2 rounded-xl hover:from-orange-500 hover:to-orange-900 transition-colors duration-300 ease-in-out shadow-md"
                              >
                                <Link
                                  href={`/blog/${blog.id}`}
                                  className="text-sm sm:text-base font-medium text-gray-800 hover:underline hover:text-orange-600"
                                >
                                  <span
                                    dangerouslySetInnerHTML={{
                                      __html: highlightSearchTerm(
                                        blog.post_title,
                                        searchQuery
                                      ),
                                    }}
                                  />
                                </Link>
                              </li>
                            ))
                          ) : (
                            <p className="text-red-800 text-xl">
                              No blogs found...
                            </p>
                          )}
                        </div>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </li>
        </ul>

        <div className="hidden md:flex items-center space-x-4">
          <button className="px-2 py-1 rounded-full border font-semibold">
            Sign Up
          </button>
          <button className="p-2 rounded-full">
            <VscAccount className="size-6" />
          </button>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <ul className="absolute top-16 left-0 w-full bg-white shadow-md flex flex-col text-lg md:hidden">
          <li className="px-4 py-2 border-b">
            <Link href="/home">Home</Link>
          </li>
          <li className="px-4 py-2 border-b">
            <Link href="/services">Services</Link>
          </li>
          <li className="px-4 py-2 border-b">
            <Link href="/about-us/testimonials">About Us</Link>
          </li>
          <li className="px-4 py-2 border-b">
            <Link href="/contact">Contact</Link>
          </li>
          <li className="px-4 py-2 border-b">
            <Link href="/blog">Blog</Link>
          </li>
        </ul>
      )}
    </header>
  );
};

export default HeaderMenu;
