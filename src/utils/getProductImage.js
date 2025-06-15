const getProductImage = (product, globalProducts, fallbackImage = "/images/placeholder.svg") => {
  try {
    const globalProduct = globalProducts?.find(
      (gp) => gp.product_id === product.product
    );
    const imageUrl = globalProduct?.product_image || fallbackImage;
    console.log(`getProductImage for product ${product.product_name}:`, {
      product_id: product.product,
      imageUrl
    });
    return imageUrl;
  } catch (error) {
    console.error("Error in getProductImage:", error);
    return fallbackImage;
  }
};

export default getProductImage;