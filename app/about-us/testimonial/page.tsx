import React from "react";
import { VideoData } from "@/app/data/videoReview";

const ReviewsPage = () => {
  return (
    <section className="bg-gray-50 py-10 p-2">
      <div className="container mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">
          All <span className="text-blue-600">Reviews</span>
        </h2>
        <div className="mb-6">
          <div className="w-16 h-1 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 rounded-md">
          {VideoData.map((video, index) => (
            <div
              key={index}
              className="bg-white shadow-lg p-4 flex flex-col items-center rounded-xl"
            >
              <iframe
                className="w-full h-48 mb-4"
                src={video.url}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <p className="text-sm text-gray-500">{video.location}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsPage;
