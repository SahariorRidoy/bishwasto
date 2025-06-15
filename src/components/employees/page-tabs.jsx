"use client"
import { usePathname } from "next/navigation"
import Link from "next/link"

export default function PageTabs() {
  const pathname = usePathname()
  
  const tabs = [
    { name: "Dashboard", href: "/employees" },
    { name: "Employees", href: "/employees/employee" },
    { name: "Attendance", href: "/employees/attendance" },
    // { name: "Leave", href: "/employees/leave" },
    // { name: "Salaries", href: "/employees/salaries" },
  ]
  
  const isActive = (tabHref) => {
    // Exact match for dashboard
    if (tabHref === "/employees" && pathname === "/employees") {
      return true
    }
    
    // For other tabs, check if the pathname starts with the href
    // but make sure we're checking full path segments
    if (tabHref !== "/employees" && pathname.startsWith(tabHref)) {
      return true
    }
    
    return false
  }

  return (
    <div className="mb-6">
      <div className="inline-flex p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`
                px-6 py-2.5 rounded-md font-medium text-sm
                transition-all duration-200 ease-out
                ${active 
                  ? "bg-[#00ADB5] text-white shadow-md dark:bg-blue-600" 
                  : "bg-transparent text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                }
              `}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  )
}