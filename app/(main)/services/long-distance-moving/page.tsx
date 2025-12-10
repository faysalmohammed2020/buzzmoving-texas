"use client";

import Categories from "@/components/Categories";
import Image from "next/image";

export default function LongDistanceMoving() {
  return (
    <main className="bg-white">
      {/* Intro Section */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Trusted Long Distance Moving Services
        </h1>
        <p className="text-lg text-gray-600">
          Whether you&apos;re relocating across the state or across the country, our expert team ensures a smooth,
          stress-free long-distance move tailored to your needs.
        </p>
      </section>

      {/* Key Benefits */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div>
            <Image
              src="/image/delevery3.jpg"
              alt="Professional Movers"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Experienced Movers</h3>
            <p className="text-gray-600 text-sm">
              Decades of expertise in handling long-distance relocations of all sizes.
            </p>
          </div>

          <div>
            <Image
              src="/image/delevery4.jpg"
              alt="Safe & Secure"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Safe & Secure</h3>
            <p className="text-gray-600 text-sm">
              Your belongings are packed and transported with utmost care.
            </p>
          </div>

          <div>
            <Image
              src="/image/img5.jpg"
              alt="24/7 Support"
              width={112}
              height={112}
              className="mx-auto h-28 mb-4 object-contain"
              priority={false}
            />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">24/7 Support</h3>
            <p className="text-gray-600 text-sm">
              Dedicated moving coordinators available anytime you need assistance.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Our Long Distance Moving Services
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "Packing & Unpacking", desc: "Full-service packing to keep your belongings safe during transit." },
            { title: "Loading & Unloading", desc: "Careful handling to protect furniture, boxes, and valuables." },
            { title: "Custom Crating", desc: "Extra protection for fragile or oversized items." },
            { title: "Storage Solutions", desc: "Secure short & long-term storage available." },
            { title: "Vehicle Transport", desc: "Safe transportation for cars, bikes, and specialty vehicles." },
            { title: "Furniture Assembly", desc: "Disassembly and reassembly services included." },
          ].map((item, idx) => (
            <div key={idx} className="p-6 border rounded-xl hover:shadow-lg transition">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Process */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
            How Our Long Distance Moving Process Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { step: "1", title: "Free Quote", desc: "Get an accurate moving estimate tailored to your needs." },
              { step: "2", title: "Planning", desc: "Dedicated coordinator designs a moving plan for you." },
              { step: "3", title: "Moving Day", desc: "Our expert crew packs, loads & transports with care." },
              { step: "4", title: "Delivery", desc: "Safe unloading, unpacking & setup at your new home." },
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-white rounded-xl shadow-sm">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center mx-auto mb-4 font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 text-center">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          {[
            {
              q: "How much does a long-distance move cost?",
              a: "Costs depend on distance, weight of belongings, and additional services like packing or storage. Contact us for a free quote.",
            },
            {
              q: "How long will my move take?",
              a: "Delivery time varies depending on distance and moving schedule. We provide estimated timelines during the quote process.",
            },
            {
              q: "Are my items insured?",
              a: "Yes, we offer multiple insurance options to give you peace of mind throughout the moving process.",
            },
          ].map((faq, idx) => (
            <div key={idx} className="p-6 border rounded-xl hover:shadow transition">
              <h3 className="font-semibold text-gray-800 mb-2">{faq.q}</h3>
              <p className="text-gray-600 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Categories />
    </main>
  );
}
