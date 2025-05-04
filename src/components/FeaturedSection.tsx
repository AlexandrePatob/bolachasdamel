"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedSectionProps {
  category: string;
  title: string;
  description: string;
  image: string;
}

const FeaturedSection = ({ category, title, description, image }: FeaturedSectionProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % 3);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + 3) % 3);
  };

  if (isMobile) {
    return (
      <div className="w-full bg-pink-50 py-8 overflow-hidden">
        <div className="relative">
          <div className="flex transition-transform duration-300 ease-in-out" style={{ transform: `translateX(-${currentSlide * 80}%)` }}>
            {[0, 1, 2].map((index) => (
              <div key={index} className="w-[80%] flex-shrink-0 px-4">
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={image}
                      alt={title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h2 className="text-2xl font-bold text-pink-600 mb-2">{title}</h2>
                    <p className="text-gray-600">{description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg"
          >
            <ChevronLeft className="w-6 h-6 text-pink-600" />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow-lg"
          >
            <ChevronRight className="w-6 h-6 text-pink-600" />
          </button>
        </div>

        <div className="flex justify-center space-x-2 mt-4">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                currentSlide === index ? "bg-pink-600" : "bg-pink-200"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-pink-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-bold text-pink-600">{title}</h2>
            <p className="text-lg text-gray-600">{description}</p>
            <button className="bg-pink-600 text-white px-8 py-3 rounded-full hover:bg-pink-700 transition-colors duration-300">
              Ver Produtos
            </button>
          </div>
          <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSection; 