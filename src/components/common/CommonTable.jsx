import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CommonTable = ({ data = [], isFetching, columns = [], itemsPerPage = 10 }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);
  
  // Check if viewport is mobile size
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener
    window.addEventListener('resize', checkIfMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Calculate pagination details
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);

  // Handle page navigation
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Generate page numbers (limit to 5 buttons for desktop, 3 for mobile)
  const getPageNumbers = () => {
    const maxButtons = isMobile ? 3 : 5;
    const half = Math.floor(maxButtons / 2);
    let startPage = Math.max(1, currentPage - half);
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Adjust startPage if endPage is at the maximum
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
  };

  // Reset to first page when data or itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length, itemsPerPage]);

  return (
    <>
      {/* Responsive table wrapper with shadow and rounded corners */}
      <div className="overflow-x-auto max-w-full dark:bg-gray-800 bg-white shadow-lg rounded-lg w-full">
        <table className="w-full min-w-full">
          <thead className="sticky top-0 z-10">
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-2 py-2 text-xs font-medium uppercase tracking-wider ${
                    col.align === "right" ? "text-right" : "text-left"
                  } text-gray-500 dark:text-gray-400`}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {isFetching ? (
              <tr>
                <td colSpan={columns.length} className="px-2 py-4 text-center">
                  <div className="flex justify-center items-center h-20">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-2 py-4 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((row, rowIndex) => (
                <tr
                  key={row.id || row.transaction_id || rowIndex}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50"
                >
                  {columns.map((col, colIndex) => {
                    const value =
                      typeof col.accessor === "function" ? col.accessor(row) : row[col.accessor];
                    return (
                      <td
                        key={colIndex}
                        className={`px-2 py-2 text-xs sm:text-sm ${
                          col.align === "right" ? "text-right" : "text-left"
                        }`}
                      >
                        {col.render ? col.render(row) : value}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls - Responsive design */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 px-2 py-3 mt-3 border-t border-gray-200 dark:border-gray-600">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
            Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} entries
          </div>
          <div className="flex space-x-1 sm:space-x-2 order-1 sm:order-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-2 py-1 rounded-md text-xs sm:text-sm flex items-center ${
                currentPage === 1
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              <ChevronLeft className="w-3 h-3 mr-1" /> {!isMobile && "Previous"}
            </button>
            {getPageNumbers().map((page) => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                className={`px-2 py-1 rounded-md text-xs sm:text-sm ${
                  currentPage === page
                    ? "bg-[#00ADB5] dark:bg-blue-500 text-white"
                    : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-2 py-1 rounded-md text-xs sm:text-sm flex items-center ${
                currentPage === totalPages
                  ? "bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
              }`}
            >
              {!isMobile && "Next"} <ChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CommonTable;