import React from "react";
import Image from "next/image";

const getProductImage = (product, globalProducts) => {
  const globalProduct = globalProducts?.find(
    (gp) => gp.product_id === product.product
  );
  return (
    globalProduct?.product_image || "https://via.placeholder.com/150"
  );
};

const ProductGrid = ({
  products,
  globalProducts,
  handleAddProductToTransaction,
}) => {
  // Show only the first 8 products
  const displayedProducts = products?.slice(0, 8) || [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4 p-4">
      {displayedProducts.map((product) => (
        <div
          key={product.id}
          className="flex items-center gap-3 border p-3 rounded shadow-sm hover:shadow-md transition cursor-pointer bg-white dark:bg-gray-800"
          onClick={() => handleAddProductToTransaction(product)}
        >
          <div className="relative w-16 h-16 flex-shrink-0">
            <Image
              src={getProductImage(product, globalProducts)}
              alt={product.product_name}
              fill
              className="object-cover rounded"
              unoptimized
            />
          </div>
          <div className="flex flex-col justify-between text-sm">
            <h3 className="font-semibold text-gray-800 dark:text-white truncate">
              {product.product_name}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              ৳{product.sell_price}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              Stock: {product.quantity}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
