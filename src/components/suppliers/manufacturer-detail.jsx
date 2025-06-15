"use client";

import {
  ArrowLeft,
  Building2,
  MapPin,
  Mail,
  Package2,
  ChevronsUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import Cookies from "js-cookie";
import { Checkbox } from "@/components/ui/checkbox";
import { useGetInventoryProductsQuery } from "@/features/productsApiSlice";

export function ManufacturerDetail({ manufacturer, onBack }) {
  const [productSelectOpen, setProductSelectOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(
    manufacturer.products
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: manufacturer.name,
    address: manufacturer.address,
    contact_info: manufacturer.contact_info,
    product_name: "",
  });

  const { data: products, isLoading } = useGetInventoryProductsQuery();

  const handleProductSelect = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateManufacturer = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}product_supplier/manufacturers/${manufacturer.id}/`,
        {
          name: formData.name,
          address: formData.address,
          contact_info: formData.contact_info,
          products: selectedProductIds,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      toast.success("Manufacturer updated successfully");
      setOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update manufacturer");
    }
  };

  const handleDeactivate = async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}product_supplier/manufacturers/${manufacturer.id}/deactivate/`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      toast.success("Manufacturer deactivated successfully");
      onBack();
    } catch (error) {
      toast.error(error.message || "Failed to deactivate manufacturer");
    }
  };

  // Map product IDs to names for display
  const productMap =
    products?.results?.reduce((map, product) => {
      map[product.id] = product.product_name;
      return map;
    }, {}) || {};

  const filteredProducts =
    products?.results?.filter((product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4 cursor-pointer">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Manufacturers
      </Button>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-4xl flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                {manufacturer.name}
              </CardTitle>
              <div className="space-x-2">
                <Dialog open={open} onOpenChange={setOpen}>
                  <DialogTrigger asChild>
                    <Button>Update manufacturer</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Update Manufacturer</DialogTitle>
                      <DialogDescription>
                        Update the manufacturer details.
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={handleUpdateManufacturer}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="name" className="mb-2">
                          Name
                        </Label>
                        <Input
                          autoComplete="off"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="address" className="mb-2">
                          Address
                        </Label>
                        <Input
                          autoComplete="off"
                          id="address"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_info" className="mb-2">
                          Contact Info
                        </Label>
                        <Input
                          autoComplete="off"
                          id="contact_info"
                          name="contact_info"
                          value={formData.contact_info}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label>Products</Label>
                        <Popover
                          open={productSelectOpen}
                          onOpenChange={setProductSelectOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={productSelectOpen}
                              className="w-full justify-between"
                            >
                              {selectedProductIds.length > 0
                                ? `${selectedProductIds.length} product(s) selected`
                                : "Select products..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[300px] p-2">
                            <Input
                              placeholder="Search products..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="mb-2"
                            />
                            <div className="max-h-[200px] overflow-y-auto">
                              {isLoading ? (
                                <p className="text-sm text-gray-500">
                                  Loading products...
                                </p>
                              ) : filteredProducts.length === 0 ? (
                                <p className="text-sm text-gray-500">
                                  No products found.
                                </p>
                              ) : (
                                filteredProducts.map((product) => (
                                  <div
                                    key={product.id}
                                    className="flex items-center space-x-2 py-1"
                                  >
                                    <Checkbox
                                      id={`product-${product.id}`}
                                      checked={selectedProductIds.includes(
                                        product.id
                                      )}
                                      onCheckedChange={() =>
                                        handleProductSelect(product.id)
                                      }
                                    />
                                    <label
                                      htmlFor={`product-${product.id}`}
                                      className="text-sm cursor-pointer"
                                    >
                                      {product.product_name}
                                    </label>
                                  </div>
                                ))
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit">Save Changes</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
                <Button variant="destructive" onClick={handleDeactivate}>
                  Deactivate
                </Button>
              </div>
            </div>
            <CardDescription className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              {manufacturer.address}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <span>{manufacturer.contact_info}</span>
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Package2 className="h-5 w-5" />
                Products ({manufacturer.products.length})
              </h3>
              {isLoading ? (
                <p>Loading products...</p>
              ) : (
                <div className="grid gap-4">
                  {manufacturer.products.map((productId) => {
                    const product = products?.results?.find(
                      (p) => p.id === productId
                    );
                    return (
                      <Card className="p-3" key={productId}>
                        <CardTitle className="text-lg">
                          {product?.product_name}
                        </CardTitle>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supply Chain</CardTitle>
            <CardDescription>Visualized connections</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="relative w-full h-[300px] border rounded-md p-4 flex items-center justify-center">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-2 rounded-full border-2 border-primary">
                <Building2 className="h-8 w-8 text-primary" />
              </div>

              {manufacturer.products.map((id, index) => {
                const angle =
                  index *
                  (360 / manufacturer.products.length) *
                  (Math.PI / 180);
                const x = 100 * Math.cos(angle);
                const y = 100 * Math.sin(angle);

                return (
                  <div key={`prod-${id}`}>
                    <div
                      className="absolute w-[50px] h-[50px] bg-background rounded-full border-2 border-green-500 flex items-center justify-center"
                      style={{
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <Package2 className="h-6 w-6 text-green-500" />
                    </div>
                    <div
                      className="absolute bg-green-500 h-[2px]"
                      style={{
                        width: `${Math.sqrt(x * x + y * y)}px`,
                        top: "50%",
                        left: "50%",
                        transform: `rotate(${Math.atan2(y, x)}rad)`,
                        transformOrigin: "0 0",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
