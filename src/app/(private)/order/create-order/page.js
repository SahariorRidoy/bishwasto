"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetGlobalProductsQuery,
  useGetInventoryProductsByShopQuery,
} from "@/features/productsApiSlice";
import { useCreateOrderMutation } from "@/features/orderApliSlice";
import { useSelector } from "react-redux";
import ProductSearch from "@/components/QuickSell/ProductSearch";
import ProductTable from "@/components/QuickSell/ProductTable";
import OrderForm from "@/components/QuickSell/OrderFrom"; // Note: Using OrderForm as provided
import ProductGrid from "@/components/QuickSell/ProductGrid";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";

const CreateOrder = () => {
  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");
  const selectedShop = useSelector((state) => state.shop?.selectedShop?.id);
  const getDefaultTransaction = (selectedShop) => ({
    shop: selectedShop,
    customer_phone_number: "",
    name: "",
    subtotal: 0.0,
    discount: 0.0,
    grand_total: 0.0,
    amount_paid: 0.0,
    amount_change: 0.0,
    note: "",
    due: 0.0,
    method: "",
    items: [],
  });

  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [transaction, setTransaction] = useState(getDefaultTransaction(selectedShop));
  const [allCustomers, setAllCustomers] = useState([]);
  const { data: globalProducts } = useGetGlobalProductsQuery();
  const { data: products } = useGetInventoryProductsByShopQuery(selectedShop, {
    skip: !selectedShop,
  });
  const [createOrder, { isLoading, isSuccess, isError }] = useCreateOrderMutation();

  // Fetch customers from the API when the selected shop changes
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const accessToken = Cookies.get("accessToken");
        if (!accessToken) {
          throw new Error("Authentication required");
        }
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}customers/list/${selectedShop}/`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        setAllCustomers(response.data || []);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };

    if (selectedShop) {
      fetchCustomers();
    }
  }, [selectedShop]);

  // Handle order creation
  const handleCreateOrder = async (transaction, callback) => {
    try {
      const result = await createOrder(transaction).unwrap();
      if (result && result.transaction_id) {
        toast.success("Order Created Successfully!");
        if (callback) {
          callback(result);
        }
      } else {
        console.error("No transaction_id in response:", result);
        toast.error("Order created, but no transaction ID returned");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("Failed to create order");
    }
  };

  // Reset form after successful order creation
  const resetForm = () => {
    setItems([]);
    setTransaction(getDefaultTransaction(selectedShop));
    setSearchTerm("");
    setPhoneSearchTerm("");
  };

  // Reset form on successful order creation
  useEffect(() => {
    if (isSuccess) {
      resetForm();
    }
  }, [isSuccess]);

  // Handler to select a customer and update transaction fields
  const handleSelectCustomer = (customer) => {
    setTransaction((prev) => ({
      ...prev,
      customer_phone_number: customer.phone_number || "",
      name: customer.name || `Customer #${customer.id}`,
    }));
    setPhoneSearchTerm(customer.phone_number || "");
  };

  const handleRemoveItem = (id) =>
    setItems(items.filter((item) => item.id !== id));

  const handleQtyChange = (id, qty) =>
    setItems(items.map((item) => (item.id === id ? { ...item, qty } : item)));

  const handleDiscountChange = (id, discount) =>
    setItems(
      items.map((item) => (item.id === id ? { ...item, discount } : item))
    );

  const handlePriceChange = (id, price) =>
    setItems(items.map((item) => (item.id === id ? { ...item, price } : item)));

  const handleTransactionFieldChange = (field, value) => {
    setTransaction((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddProductToTransaction = (product) => {
    const existingItem = items.find((item) => item.id === product.id);

    if (existingItem) {
      const updatedItems = items.map((item) =>
        item.id === product.id ? { ...item, qty: item.qty + 1 } : item
      );
      setItems(updatedItems);
    } else {
      const newItem = {
        id: product.id,
        name: product.product_name,
        price: product.sell_price || 0,
        qty: 1,
        discount: 0,
        stock: product.quantity || 0,
      };
      setItems([...items, newItem]);
    }

    setSearchTerm("");
  };

  const handleCalculateTotals = () => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );
    const discountedTotal = items.reduce(
      (sum, item) => sum + item.qty * item.price * (1 - item.discount / 100),
      0
    );
    const newDiscount = newSubtotal - discountedTotal;

    const updatedItems = items.map((item) => ({
      product_stock: item.id,
      quantity: item.qty,
      discount_type: "percentage",
      discount_total: Number(
        ((item.qty * item.price * item.discount) / 100).toFixed(2)
      ),
      total_discounted_amount: Number(
        (item.qty * item.price * (1 - item.discount / 100)).toFixed(2)
      ),
    }));

    const updatedTransaction = {
      ...transaction,
      subtotal: Number(newSubtotal.toFixed(2)),
      discount: Number(newDiscount.toFixed(2)),
      grand_total: Number(discountedTotal.toFixed(2)),
      amount_change: Number(
        Math.max(transaction.amount_paid - discountedTotal, 0).toFixed(2)
      ),
      due: Number(
        Math.max(discountedTotal - transaction.amount_paid, 0).toFixed(2)
      ),
      items: updatedItems,
    };

    setTransaction(updatedTransaction);
  };

  return (
    <div className="w-full h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Create Sales</h1>
          <p className="text-muted-foreground mt-1">
            Sell your products to customers and manage orders efficiently.
          </p>
        </div>
      </div>

      <div className="w-full flex-1 flex gap-4 justify-between flex-col py-6 lg:flex-row relative rounded-lg">
        <Card className="backdrop-blur-sm border lg:w-2/3">
          <CardHeader>
            <div className="flex items-center gap-3 justify-between">
              <CardTitle className="text-2xl font-bold dark:text-primarytext">
                Create POS Order
              </CardTitle>
              <Button className="bg-[#00ADB5] text-white hover:bg-[#65b7bdea] dark:bg-blue-500 dark:hover:bg-blue-700 hover:cursor-pointer">
                <Link href="/order/order-lists">Sales List</Link>
              </Button>
            </div>
            <ProductSearch
              globalProducts={globalProducts}
              products={products}
              handleAddProductToTransaction={handleAddProductToTransaction}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </CardHeader>
          <CardContent>
            <ProductTable
              items={items}
              handlePriceChange={handlePriceChange}
              handleQtyChange={handleQtyChange}
              handleDiscountChange={handleDiscountChange}
              handleRemoveItem={handleRemoveItem}
            />
          </CardContent>
        </Card>

        <Card className="backdrop-blur-sm border lg:w-1/3">
          <CardHeader>
            <CardTitle className="text-2xl font-bold dark:text-primarytext">
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OrderForm
              is_POS
              customers={allCustomers}
              transaction={transaction}
              handleTransactionFieldChange={handleTransactionFieldChange}
              handleCalculateTotals={handleCalculateTotals}
              createOrder={handleCreateOrder}
              isLoading={isLoading}
              items={items}
              phoneSearchTerm={phoneSearchTerm}
              setPhoneSearchTerm={setPhoneSearchTerm}
              handleSelectCustomer={handleSelectCustomer}
              resetForm={resetForm}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-sm border">
        <CardHeader>
          <CardTitle className="text-xl font-bold dark:text-primarytext">
            Products
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto">
          <ProductGrid
            products={products?.slice(0, 20)}
            globalProducts={globalProducts}
            handleAddProductToTransaction={handleAddProductToTransaction}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrder;