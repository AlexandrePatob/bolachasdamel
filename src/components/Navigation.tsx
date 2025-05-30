"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  content?: React.ReactNode;
}

interface NavigationProps {
  tabs: Tab[];
  otherCategories?: { id: string; label: string }[];
  onCategoryChange?: (categoryId: string) => void;
}

const Navigation = ({
  tabs,
  otherCategories = [],
  onCategoryChange,
}: NavigationProps) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onCategoryChange?.(tabId);
  };

  return (
    <div className="w-full px-2 md:px-8">
      <div className="flex justify-center items-center gap-2 md:gap-4 mb-8">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-base md:text-lg font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? "bg-pink-600 text-white shadow-lg"
                : "text-pink-600 hover:bg-pink-50"
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab.label}
          </motion.button>
        ))}

        {otherCategories.length > 0 && (
          <div className="relative">
            <motion.button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`px-4 md:px-6 py-2 md:py-3 rounded-full text-base md:text-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                otherCategories.some((cat) => cat.id === activeTab)
                  ? "bg-pink-600 text-white shadow-lg"
                  : "text-pink-600 hover:bg-pink-50"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span>
                {otherCategories.find((cat) => cat.id === activeTab)?.label ||
                  "Outras Categorias"}
              </span>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-pink-100 py-2 z-50"
                >
                  {otherCategories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => {
                        handleTabChange(category.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-pink-50 transition-colors text-gray-600 hover:text-pink-600"
                    >
                      {category.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
      {tabs.find(tab => tab.id === activeTab)?.content}
    </div>
  );
};

export default Navigation;
