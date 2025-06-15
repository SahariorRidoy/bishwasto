"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

// Testimonial Data
const testimonials = [
  {
    name: "Kate Rogers",
    role: "Graphic Designer",
    image: "/testimonialimage/436638359.jpg",
    review: "Great customer service for a last-minute event change refund!",
  },
  {
    name: "John Smith",
    role: "Marketing Lead",
    image: "/testimonialimage/OIP.jpg",
    review: "Wonderful support! Issues resolved in minutes.",
  },
  {
    name: "Emily Stone",
    role: "UI/UX Designer",
    image:
      "/testimonialimage/portrait-indian-male-small-kirana-grocery-shop-owner-sitting-cash-counter-looking-happily-camera_466689-96186.avif",
    review: "Friendly, fast, and reliable service. Very satisfied!",
  },
  {
    name: "David Lee",
    role: "Software Engineer",
    image: "/testimonialimage/OIP.jpg",
    review: "Impressive support and quick turnaround. Highly recommend!",
  },
];

// ✅ Testimonial Card Component
const TestimonialCard = ({ name, role, image, review }) => (
  <div className="bg-white dark:bg-blue-900/50 rounded-2xl p-5 w-full max-w-xs h-[250px] sm:max-w-sm md:max-w-md flex flex-col items-center text-center shadow-md dark:shadow-blue-900 mx-auto">
    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-blue-200 dark:border-blue-700 mb-3">
      <Image src={image} alt={name} fill className="object-cover" />
    </div>
    <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base italic mb-2 line-clamp-3">
      "{review}"
    </p>
    <h3 className="text-cyan-800 dark:text-blue-300 font-semibold text-sm sm:text-base">
      {name}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm mb-2">
      {role}
    </p>
    <div className="flex gap-1 text-yellow-400">
      {Array(5)
        .fill()
        .map((_, i) => (
          <Star key={i} className="w-4 h-4 fill-current" />
        ))}
    </div>
  </div>
);

// ✅ Main Component
export default function Testimonial() {
  return (
    <section className="container md:max-w-7xl py-8 mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800 dark:text-blue-400">
        What Our Customers Say
      </h2>
      <Swiper
        modules={[Autoplay, Pagination]}
        spaceBetween={16}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        breakpoints={{
          0: { slidesPerView: 1 }, // Mobile
          640: { slidesPerView: 1.2 }, // Slightly wider phones
          768: { slidesPerView: 2 }, // Tablet
          1024: { slidesPerView: 3 }, // Desktop
        }}
        className="pb-10"
      >
        {testimonials.map((t, index) => (
          <SwiperSlide key={index} className="flex justify-center px-2">
            <TestimonialCard {...t} />
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
}
