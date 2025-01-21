"use client";

import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { statedata } from "@/app/data/statedata";
import Image from "next/image";

const MovingCostCalculator: React.FC = () => {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [movingFrom, setMovingFrom] = useState<string>("");
  const [movingTo, setMovingTo] = useState<string>("");
  const [movingType, setMovingType] = useState<string>("");
  const [movingDate, setMovingDate] = useState<Date | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState<boolean>(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCardOpen, setIsCardOpen] = useState<boolean>(true); // ✅ Always Open

  const handleCalculate = () => {
    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = "Name is required.";
    if (!email) newErrors.email = "Email is required.";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format.";
    if (!acceptedTerms)
      newErrors.terms = "You must accept the Terms and Conditions.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      alert(
        `Calculating cost for ${name} (${email}), moving from ${movingFrom} to ${movingTo}, ${movingType}, on ${movingDate?.toDateString()}`
      );
    }
  };

  return (
    <div>
      {/* ✅ No Close Button & Always Open */}
      {isCardOpen && (
        <div className="max-w-3xl bg-[#F3F4F6] hover:bg-white text-gray-700 hover:text-black p-6 border-2 border-[#a58e67] hover:border-none rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6">
            Calculate Moving Cost & Get Quote
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-lg font-medium">
                Enter Your Name
              </label>
              <input
                type="text"
                id="name"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 text-lg text-black border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 placeholder-gray-400"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-lg font-medium">
                Enter Your Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 text-lg text-black border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 placeholder-gray-400"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>

            {/* Moving From */}
            <div>
              <label
                htmlFor="moving-from"
                className="block text-lg font-medium"
              >
                Where are you moving from?
              </label>
              <input
                type="text"
                id="moving-from"
                placeholder="Enter state"
                value={movingFrom}
                onChange={(e) => setMovingFrom(e.target.value)}
                className="w-full p-2 text-lg text-black border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 placeholder-gray-400"
              />
            </div>

            {/* Moving To */}
            <div>
              <label htmlFor="moving-to" className="block text-lg font-medium">
                Where are you moving to?
              </label>
              <input
                type="text"
                id="moving-to"
                placeholder="Enter state"
                value={movingTo}
                onChange={(e) => setMovingTo(e.target.value)}
                className="w-full p-2 text-lg text-black border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 placeholder-gray-400"
              />
            </div>

            {/* Moving Type */}
            <div>
              <label
                htmlFor="moving-type"
                className="block text-lg font-medium"
              >
                What are you moving?
              </label>
              <select
                id="moving-type"
                value={movingType}
                onChange={(e) => setMovingType(e.target.value)}
                className="w-full p-2 text-lg text-gray-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 placeholder-gray-400"
              >
                <option value="" disabled>
                  Select Moving Size
                </option>
                {[
                  "Studio residence",
                  "1 bedroom residence",
                  "2 bedroom residence",
                  "3 bedroom residence",
                  "4+ bedroom residence",
                  "Office move",
                ].map((option, index) => (
                  <option key={index} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            {/* Moving Date */}
            <div>
              <label
                htmlFor="moving-date"
                className="block text-lg font-medium"
              >
                When are you moving?
              </label>
              <DatePicker
                id="moving-date"
                selected={movingDate}
                onChange={(date: Date | null) => setMovingDate(date)}
                placeholderText="Pick your moving date"
                className="w-full p-2 text-lg text-black border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 placeholder-gray-400"
                minDate={new Date()}
              />
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center col-span-2">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mr-2"
              />
              <label htmlFor="terms" className="text-sm">
                I accept the{" "}
                <a href="/terms" className="underline">
                  Terms and Conditions
                </a>
              </label>
            </div>
            {errors.terms && (
              <p className="text-red-500 text-sm mt-1 col-span-2">
                {errors.terms}
              </p>
            )}
          </div>

          <div className="mt-4 flex justify-center">
            <button
              onClick={handleCalculate}
              className="px-6 py-3 bg-amber-700 text-white text-lg font-semibold rounded-xl shadow-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              Calculate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovingCostCalculator;
