"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

/**
 * @param {Object} props
 * @param {import('lucide-react').LucideIcon} props.icon - Lucide icon component
 * @param {string} props.label - Menu item label
 * @param {boolean} props.isOpen - Whether sidebar is expanded
 * @param {boolean} [props.active] - Whether item is active
 * @param {React.ReactNode} [props.children] - Optional submenu items
 */
export default function SidebarItem({ icon: Icon, label, isOpen, active = false, children }) {
  const [isExpanded, setIsExpanded] = useState(active || label === "Dashboard")

  return (
    <div className="mb-1">
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200",
          active || isExpanded
            ? "bg-gradient-to-r from-[#02767c] to-[#00ADB5] dark:from-blue-500 dark:to-blue-600 text-white shadow-md"
            : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200",
        )}
        onClick={() => children && setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <Icon className={cn("w-5 h-5", active || isExpanded ? "text-white" : "")} />
          {isOpen && <span>{label}</span>}
        </div>
        {isOpen && children && (
          <ChevronDown className={cn("w-4 h-4 transition-transform", isExpanded ? "rotate-180" : "")} />
        )}
      </div>
      {children && isExpanded && (
        <div className={cn("mt-1 space-y-1 overflow-hidden transition-all duration-200", isOpen ? "pl-10" : "pl-2")}>
          {children}
        </div>
      )}
    </div>
  )
}
