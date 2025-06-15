import React from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import getProductImage from "@/utils/getProductImage";

const ProductSearch = ({
  globalProducts,
  products,
  handleAddProductToTransaction,
  searchTerm,
  setSearchTerm,
}) => {
  // Safely filter products based on searchTerm
 const filteredProducts = (Array.isArray(products) ? products : products?.results || []).filter((p) => {
  const searchLower = searchTerm.toLowerCase();
  const name = p?.product_name;
  const id = p?.product;
  const nameMatch = name?.toLowerCase().includes(searchLower);
  const idMatch = id?.toString().includes(searchLower);
  return nameMatch || idMatch;
});


  return (
    <div className="relative">
      <div className="w-full flex flex-col relative">
        <Input
          className="border px-3 mt-5 py-2 bg-transparent focus:ring-0"
          placeholder="Start typing Item Name, ID, or scan Barcode..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && filteredProducts.length > 0 && (
          <div className="absolute top-10 z-10 w-full rounded border mt-6 max-h-40 overflow-y-auto dark:bg-gray-700 bg-gray-300">
            {filteredProducts.map((p) => {
              const productImage = getProductImage(p, globalProducts);
              return (
                <div
                  key={p?.id}
                  className="p-2 dark:hover:bg-gray-300/30 hover:bg-gray-200 cursor-pointer flex items-center"
                  onClick={() => handleAddProductToTransaction(p)}
                >
                  <div className="w-12 h-12 mr-3 overflow-hidden rounded">
                    <Image
                      loader={() => productImage}
                      src={productImage}
                      height={48}
                      width={48}
                      alt={p?.product_name || "Product image"}
                      className="object-cover overflow-hidden rounded"
                      priority
                      unoptimized
                      style={{ width: "auto", height: "auto" }}
                    />
                  </div>
                  <span>
                     {p?.product_name} - ৳{p?.sell_price}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductSearch;