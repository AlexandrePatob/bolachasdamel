"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";

interface Category {
  id: string;
  label: string;
}

interface CategoryNavProps {
  categories: Category[];
  activeSection: string;
  setActiveSection: (section: string) => void;
}

export default function CategoryNav({
  categories,
  activeSection,
  setActiveSection,
}: CategoryNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const mainCategories = categories.slice(0, 3);
  const otherCategories = categories.slice(3);

  return (
    <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Main Categories */}
          <div className="flex-1 flex items-center justify-start overflow-x-auto scrollbar-hide">
            <nav className="flex space-x-1 px-4">
              {mainCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveSection(category.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === category.id
                      ? "bg-pink-50 text-pink-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Hamburger Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600 hover:text-pink-600 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-pink-100 py-2"
              >
                <div className="px-4 py-2 border-b border-pink-100">
                  <h3 className="text-sm font-medium text-pink-600">
                    Categorias
                  </h3>
                </div>
                {otherCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setActiveSection(category.id);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-pink-50 transition-colors ${
                      activeSection === category.id
                        ? "text-pink-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
