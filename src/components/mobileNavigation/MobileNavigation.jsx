'use client';
import { useState } from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Home,
  Package, 
  ShoppingCart,
  Users,
  List,
  DollarSign,
  MessageCircle,
  UserCheck, 
  MoreHorizontal,
  ShoppingBasket,
  MailCheck,
  ReceiptRussianRuble,
  Receipt,
  Truck,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function MobileNavigation({ currentPath }) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  
  // Primary navigation items (shown directly in the bottom bar)
  const primaryNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: ShoppingCart, label: "Sales", href: "/order/create-order" },
    { icon: ShoppingBasket, label: "Quick Sale", href: "/quick-sell" },
  ];
  
  // Secondary navigation items (shown in the dropdown)
  const secondaryNavItems = [
    
    { icon: Home, label: "Shop", href: "/shop" },
    { icon: Package, label: "Products", href: "/inventory/products" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: List, label: "Due List", href: "/dues-list" },
    { icon: Receipt, label: "Invoice", href: "/inventory/invoice" },
    { icon: Truck, label: "Suppliers", href: "/inventory/suppliers" },
    { icon: RotateCcw, label: "Returns", href: "/inventory/returns" },
    { icon: DollarSign, label: "Wholesale", href: "/wholesale" },
    { icon: MessageCircle, label: "SMS", href: "/sms" },
    { icon: UserCheck, label: "Employees", href: "/employees" },
  ];
  
  const isActive = (path) => {
    if (path === currentPath) return true;
    // Handle parent paths (like /inventory/*)
    if (path !== "/dashboard" && currentPath && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-40">
        <div className="flex items-center justify-between px-2">
          {primaryNavItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href} 
              className={cn(
                "flex flex-col items-center p-2 text-xs min-w-0",
                isActive(item.href) 
                  ? "text-[#00ADB5] dark:text-blue-500 font-medium" 
                  : "text-gray-600 dark:text-gray-400"
              )}
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="truncate">{item.label}</span>
            </Link>
          ))}
          
          {/* Theme toggle */}
          
          
          {/* More menu button */}
          <button
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className={cn(
              "flex flex-col items-center p-2 text-xs",
              isMoreOpen || secondaryNavItems.some(item => isActive(item.href))
                ? "text-[#00ADB5] dark:text-blue-500 font-medium"
                : "text-gray-600 dark:text-gray-400"
            )}
          >
            <MoreHorizontal className="w-5 h-5 mb-1" />
            <span>More</span>
          </button>
        </div>
      </div>
      
      {/* More menu dropdown (slides up from bottom) */}
      {isMoreOpen && (
        <div className="fixed bottom-16 left-0 right-0 p-3 bg-white dark:bg-gray-800 rounded-t-xl border-t border-gray-200 dark:border-gray-700 shadow-lg z-50 max-h-64 overflow-y-auto">
          <div className="grid grid-cols-3 gap-2">
            {secondaryNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center p-3 rounded-lg",
                  isActive(item.href)
                    ? "bg-[#00ADB5]/10 dark:bg-blue-500/10 text-[#00ADB5] dark:text-blue-500"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                )}
                onClick={() => setIsMoreOpen(false)}
              >
                <item.icon className="w-6 h-6 mb-1" />
                <span className="text-xs text-center">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Overlay to close the menu when clicking outside */}
      {isMoreOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={() => setIsMoreOpen(false)} 
        />
      )}
    </>
  );
}