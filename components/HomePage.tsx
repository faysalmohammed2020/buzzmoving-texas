
"use client";

import { useEffect, useState } from "react";
import CustomerReviews from "@/components/CustomerReview";
import EmailSubscription from "@/components/EmailSubmission";
import HeroSection from "@/components/hero";
import RelatedPost from "@/components/RelatedPost";
import VideoReviews from "@/components/VideoReview";
import Categories from "./Categories";
import MovingCalculator from "./CostCalculator";

const HomePage = () => {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);

      // Clear timeout if user keeps scrolling
      clearTimeout(scrollTimeout);

      // Set timeout to reset the state after scrolling stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false);
      }, 500); // Adjust timeout duration as needed
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);

  return (
    <>
      <div className="relative">
        {/* Moving Calculator Section */}
        <div
          className={`fixed top-[15%] right-[2.52%] z-30 w-[700px] h-[650px] transform transition-all duration-300 ${
            isScrolling ? "scale-[0.4]" : "scale-[1]"
          }`}
          style={{ transformOrigin: "top right" }} // Adjust origin for zoom effect
        >
          <MovingCalculator />
        </div>

        {/* Main Content */}
        <div className="overflow-y-auto">
          <HeroSection />

          <div>
            <h2 className="text-3xl font-bold text-center mt-7 pl-5">
              Recent <span className="text-orange-600">Articles</span>
            </h2>
            <div className="mb-6 mt-2">
              <div className="w-16 h-1 bg-orange-600 mx-auto"></div>
            </div>
          </div>
          <RelatedPost currentPostID="119" />
          <CustomerReviews />
          <VideoReviews />
          <Categories />
          <EmailSubscription />
        </div>
      </div>
    </>
  );
};

export default HomePage;
