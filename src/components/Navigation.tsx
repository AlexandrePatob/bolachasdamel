"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

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

  const allCategories = [
    ...tabs.map((t) => ({ id: t.id, label: t.label })),
    ...otherCategories,
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onCategoryChange?.(tabId);
  };

  return (
    <div className="w-full">
      {/* Scrollable pill row */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 px-1 mb-8">
        {allCategories.map((cat) => {
          const isActive = activeTab === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => handleTabChange(cat.id)}
              whileTap={{ scale: 0.95 }}
              className={`relative flex-shrink-0 px-5 py-2 rounded-full text-sm font-medium transition-colors duration-200 cursor-pointer ${
                isActive
                  ? "bg-pink-600 text-white shadow-sm shadow-pink-200"
                  : "bg-white text-gray-500 hover:text-pink-600 hover:bg-pink-50 border border-gray-100"
              }`}
            >
              {cat.label}
              {isActive && (
                <motion.span
                  layoutId="nav-active-pill"
                  className="absolute inset-0 rounded-full bg-pink-600 -z-10"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Active tab content (for tabs with embedded content like "Quem Somos") */}
      {tabs.find((tab) => tab.id === activeTab)?.content}
    </div>
  );
};

export default Navigation;
