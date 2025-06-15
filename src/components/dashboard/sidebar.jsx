"use client"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  Menu,
  LayoutDashboard,
  Home,
  Package,
  ShoppingCart,
  Users,
  UserCheck,
  MessageCircle,
  List,
  DollarSign,
  ChevronDown,
  ChevronUp,
  ShoppingBasket,
} from "lucide-react"
import Link from "next/link"
import React from "react"

function SidebarItem({ icon: Icon, label, href, isOpen, active, currentPath, children }) {
  const [showSubMenu, setShowSubMenu] = useState(active);
  const [isPressed, setIsPressed] = useState(false);
  const hasChildren = Boolean(children);

  useEffect(() => {
    if (hasChildren && currentPath && href && currentPath.startsWith(href)) {
      setShowSubMenu(true);
    }
  }, [currentPath, hasChildren, href]);

  const handleClick = () => {
    if (hasChildren) {
      // Visual feedback for click
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      setShowSubMenu(!showSubMenu);
    }
  };

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const content = (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-md cursor-pointer transition-all duration-150",
        isOpen ? "" : "justify-center",
        {
          // Active state
          "bg-[#00ADB5] dark:bg-blue-600 text-white shadow-md": active,
          // Hover state - deeper colors on hover
          "hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-600": !active,
          // Pressed state - simulate button press with transform and shadow
          "transform scale-95 bg-teal-700 dark:bg-blue-700 shadow-inner": isPressed && !active,
        }
      )}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => setIsPressed(false)}
    >
      <div className={cn("flex items-center gap-2", isOpen ? "" : "justify-center")}>
        <Icon className={cn("w-5 h-5", { "transform scale-95": isPressed })} />
        {isOpen && <span className={cn({ "transform scale-95": isPressed })}>{label}</span>}
      </div>
      {isOpen && hasChildren && (
        showSubMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </div>
  )

  return (
    <div className="flex flex-col">
      {href && !hasChildren ? (
        <Link href={href} className="block">
          {content}
        </Link>
      ) : (
        <div>{content}</div>
      )}
      {isOpen && children && showSubMenu && (
        <div className="ml-4 mt-1 space-y-1">
          {React.Children.map(children, child => {
            const isChildActive = child.props.href === currentPath;
            return React.cloneElement(child, {
              className: cn(
                child.props.className,
                {
                  "bg-[#00ADB5] dark:bg-blue-600 text-white shadow-md": isChildActive
                }
              )
            });
          })}
        </div>
      )}
    </div>
  )
}

export default function Sidebar({ isOpen, toggleSidebar, currentPath = "" }) {
  return (
    <div
      className={cn(
        "fixed md:relative z-30 flex flex-col bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-screen transition-all duration-300 border-r border-gray-200 dark:border-gray-700 shadow-lg",
        isOpen ? "lg:w-56 md:w-44" : "w-16", // Reduced width when collapsed for better appearance
      )}
    >
      <div className={cn(
        "flex border-b mt-0.5 border-gray-200 dark:border-gray-700 shadow-md",
        isOpen ? "flex-row items-center justify-between px-4 py-7" : "flex-col items-center "
      )}>
        <Link
          href="/dashboard"
          className={cn(
            "font-bold tracking-wide bg-gradient-to-r text-[#079097] dark:text-blue-500 bg-clip-text",
            isOpen ? "md:text-2xl lg:text-3xl" : "text-4xl mb-1"
          )}
        >
          {isOpen ? "Bishwasto" : "B"}
        </Link>
        <button
          onClick={toggleSidebar}
          className={cn(
            "p-2 rounded-lg cursor-pointer hover:bg-teal-100 dark:hover:bg-gray-700 active:bg-teal-200 dark:active:bg-gray-600 transition-colors",
            !isOpen && "mt-3"
          )}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className={cn(
        "flex flex-col overflow-y-auto",
        isOpen ? "gap-1 p-3" : "gap-1 p-2 items-center"
      )}>
        <SidebarItem
          icon={LayoutDashboard}
          label="Dashboard"
          href="/dashboard"
          isOpen={isOpen}
          active={currentPath === "/dashboard"}
          currentPath={currentPath}
        />
        <SidebarItem
          icon={Home}
          label="Shop"
          href="/shop"
          isOpen={isOpen}
          active={currentPath === "/shop"}
          currentPath={currentPath}
        />
        <SidebarItem
          icon={ShoppingCart}
          label="Sales"
          href="/order/create-order"
          isOpen={isOpen}
          active={currentPath === "/order" || (currentPath && currentPath.startsWith("/order"))}
          currentPath={currentPath}
        >
          {/* <Link
            href="/order/create-order"
            className="block py-1.5 pl-6 pr-3 text-sm rounded-md hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-500 active:bg-[#00ADB5] dark:active:bg-blue-600 active:transform active:scale-95 transition-all duration-150"
          >
            Create Order
          </Link>
          <Link
            href="/order/order-lists"
            className="block py-1.5 pl-6 pr-3 text-sm rounded-md hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-500 active:bg-[#00ADB5] dark:active:bg-blue-600 active:transform active:scale-95 transition-all duration-150"
          >
            Order Lists
          </Link> */}
        </SidebarItem>
        <SidebarItem
          icon={ShoppingBasket}
          label="Quick Sell"
          href="/quick-sell"
          isOpen={isOpen}
          active={currentPath === "/quick-sell"}
          currentPath={currentPath}
        />
        <SidebarItem
          icon={Package}
          label="Inventory"
          href="/inventory"
          isOpen={isOpen}
          active={currentPath && currentPath.startsWith("/inventory")}
          currentPath={currentPath}
        >
          <Link
            href="/inventory/products"
            replace
            className="block py-1.5 pl-6 pr-3 text-sm rounded-md hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-500 active:bg-[#00ADB5] dark:active:bg-blue-600 active:transform active:scale-95 transition-all duration-150"
          >
            Products
          </Link>
          <Link
            href="/inventory/invoice"
            replace
            className="block py-1.5 pl-6 pr-3 text-sm rounded-md hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-500 active:bg-[#00ADB5] dark:active:bg-blue-600 active:transform active:scale-95 transition-all duration-150"
          >
            Invoice
          </Link>
          <Link
            href="/inventory/suppliers"
            replace
            className="block py-1.5 pl-6 pr-3 text-sm rounded-md hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-500 active:bg-[#00ADB5] dark:active:bg-blue-600 active:transform active:scale-95 transition-all duration-150"
          >
            Suppliers
          </Link>
          <Link
            href="/inventory/returns"
            replace
            className="block py-1.5 pl-6 pr-3 text-sm rounded-md hover:bg-[#00ADB5] hover:text-white dark:hover:bg-blue-500 active:bg-[#00ADB5] dark:active:bg-blue-600 active:transform active:scale-95 transition-all duration-150"
          >
            Returns
          </Link>
        </SidebarItem>

        <SidebarItem
          icon={Users}
          label="Customers"
          href="/customers"
          isOpen={isOpen}
          active={currentPath === "/customers"}
          currentPath={currentPath}
        />
        <SidebarItem
          icon={List}
          label="Due List"
          href="/dues-list"
          replace
          isOpen={isOpen}
          active={currentPath === "/dues-list"}
          currentPath={currentPath}
        />
        <SidebarItem
          icon={DollarSign}
          label="Wholesale"
          href="/wholesale"
          replace
          isOpen={isOpen}
          active={currentPath === "/wholesale"}
          currentPath={currentPath}
        />
        <SidebarItem
          icon={MessageCircle}
          label="SMS"
          href="/sms"
          replace
          isOpen={isOpen}
          active={currentPath && currentPath.startsWith("/sms")}
          currentPath={currentPath}
        />
        <SidebarItem
          icon={UserCheck}
          label="Employees"
          href="/employees"
          replace
          isOpen={isOpen}
          active={currentPath && currentPath.startsWith ("/employees")}
          currentPath={currentPath}
        />
      </nav>
    </div>
  )
}