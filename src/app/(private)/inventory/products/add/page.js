"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const ProductStock = () => {
  // For demo, keep as simple state just to allow field focus/clearing, not real functionality
  const [form, setForm] = useState({
    product: "",
    shop: "",
    quantity: "",
    buy_price: "",
    sell_price: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setForm({ product: "", shop: "", quantity: "", buy_price: "", sell_price: "" });
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full  shadow-xl animate-fade-in">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold dark:text-blue-400 mb-2">Add Product Stock</CardTitle>
          <p className="text-center text-sm text-muted-foreground">
            Update stock levels for a product in your shop.
          </p>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              // Just for demo purposes, no real submission
            }}
          >
            <div>
              <Label htmlFor="product" className="mb-1">
                Product
              </Label>
              <Input
                id="product"
                name="product"
                placeholder="Enter product name or ID"
                value={form.product}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>
            <div>
              <Label htmlFor="shop" className="mb-1">
                Shop
              </Label>
              <Input
                id="shop"
                name="shop"
                placeholder="Enter shop name or ID"
                value={form.shop}
                onChange={handleChange}
                autoComplete="off"
                required
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="quantity" className="mb-1">
                  Quantity
                </Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  placeholder="e.g. 10"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="buy_price" className="mb-1">
                  Buy Price
                </Label>
                <Input
                  id="buy_price"
                  name="buy_price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 500.00"
                  value={form.buy_price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="sell_price" className="mb-1">
                  Sell Price
                </Label>
                <Input
                  id="sell_price"
                  name="sell_price"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 600.00"
                  value={form.sell_price}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            <div className="flex justify-between pt-2">
              <Button
                variant="outline"
                type="button"
                className="border-gray-300 text-gray-700"
                onClick={handleReset}
              >
                Clear
              </Button>
              <Button type="submit" className="bg-[#00ADB5] cursor-pointer hover:bg-[#70c6ca] dark:bg-blue-500 dark:hover:bg-blue-700 text-white font-semibold">
                Add Stock
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductStock;