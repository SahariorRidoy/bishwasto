"use client";

import { useState } from "react";
import axios from "axios";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  Package2,
  Building2,
  Plus,
  ChevronsUpDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Cookies from "js-cookie";
import { useGetInventoryProductsQuery } from "@/features/productsApiSlice";
import toast from "react-hot-toast";

export function DistributorDetail({ distributor, onBack }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState(
    distributor.products
  );
  const [productSelectOpen, setProductSelectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    name: distributor.name,
    address: distributor.address,
    contact_info: distributor.contact_info,
    manufacturers: distributor.manufacturers.join(","),
  });
  const { data: products, isLoading } = useGetInventoryProductsQuery();
  console.log(distributor);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSelect = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleUpdateDistributor = async (e) => {
    e.preventDefault();
    const { name, address, contact_info, manufacturers } = formData;

    const manufacturerIds = manufacturers
      .split(",")
      .map((id) => id.trim())
      .filter((id) => id)
      .map(Number);

    if (!selectedProductIds.length) {
      setError("At least one product must be selected.");
      return;
    }
    if (!manufacturerIds.every((id) => Number.isInteger(id))) {
      setError("Manufacturers must be comma-separated numbers.");
      return;
    }

    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}product_supplier/distributors/${distributor.id}/`,
        {
          name,
          address,
          contact_info,
          products: selectedProductIds,
          manufacturers: manufacturerIds,
          is_active: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      setSelectedProductIds([]);
      setSearchTerm("");
      setOpen(false);
      toast.success("Distributor updated successfully!");
    } catch {
      setError("Failed to update distributor.");
      toast.error("Failed to update distributor.");
    }
  };

  const handleDeactivateDistributor = async () => {
    try {
      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}product_supplier/distributors/${distributor.id}/deactivate/`,
        // { is_active: false },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${Cookies.get("accessToken")}`,
          },
        }
      );
      toast.success("Manufacturer deactivated successfully");
      onBack();
    } catch {
      setError("Failed to deactivate distributor.");
    }
  };

  const filteredProducts =
    products?.results?.filter((product) =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

  // Map product IDs to names for display
  const productMap =
    products?.results?.reduce((map, product) => {
      map[product.id] = product.product_name;
      return map;
    }, {}) || {};

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Distributors
      </Button>

      <div className="grid gap-6 md:grid-cols-[2fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-4xl flex items-center gap-2">
              <div className="w-full flex justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="h-6 w-6" />
                  {distributor.name}
                </div>
                <div className="flex gap-2">
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-[#00ADB5] hover:bg-[#589ea1] text-white">
                        <Plus className="h-4 w-4 mr-2" />
                        Update Distributor
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Update Distributor</DialogTitle>
                        <DialogDescription>
                          Update distributor details.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateDistributor}>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              placeholder="e.g., XYZ Distributors"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="address">Address</Label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="e.g., 67890 Distribution Zone, New York"
                              required
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="contact_info">Contact Info</Label>
                            <Input
                              id="contact_info"
                              name="contact_info"
                              value={formData.contact_info}
                              onChange={handleInputChange}
                              placeholder="e.g., 0123456789"
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
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
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
                          <div className="grid gap-2">
                            <Label htmlFor="manufacturers">
                              Manufacturer IDs
                            </Label>
                            <Input
                              id="manufacturers"
                              name="manufacturers"
                              value={formData.manufacturers}
                              onChange={handleInputChange}
                              placeholder="e.g., 1,2"
                              required
                            />
                          </div>
                          {error && (
                            <p className="text-sm text-red-500">{error}</p>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            className="bg-[#00ADB5] hover:bg-[#589ea1]"
                          >
                            Update Distributor
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    className="bg-red-500 hover:bg-red-600 text-white"
                    onClick={handleDeactivateDistributor}
                  >
                    Deactivate Distributor
                  </Button>
                </div>
              </div>
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-base">
              <MapPin className="h-4 w-4" />
              {distributor.address}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-muted-foreground" />
              <span>{distributor.contact_info}</span>
            </div>

            <Tabs defaultValue="products">
              <TabsList>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="manufacturers">Manufacturers</TabsTrigger>
              </TabsList>
              <TabsContent value="products" className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Package2 className="h-5 w-5" />
                  Products ({distributor.products.length})
                </h3>
                <div className="grid gap-4">
                  {distributor.products.map((productId) => (
                    <Card key={productId}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {productMap[productId] || `Product #${productId}`}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </TabsContent>
              {/* <TabsContent value="manufacturers" className="space-y-4 pt-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Manufacturers ({distributor.manufacturers.length})
                </h3>
                <div className="grid gap-4">
                  {distributor.manufacturers.map((manufacturer) => (
                    <Card key={manufacturer.id}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">
                          {manufacturer.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="py-2">
                        <p className="text-sm text-muted-foreground">
                          Manufacturer details would be displayed here
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent> */}
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supply Chain</CardTitle>
            <CardDescription>Visualized connections</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center p-6">
            <div className="relative w-full h-[300px] border rounded-md p-4 flex items-center justify-center">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background p-2 rounded-full border-2 border-blue-500">
                <Truck className="h-8 w-8 text-blue-500" />
              </div>

              {distributor.manufacturers.map((id, index) => {
                const angle =
                  index *
                  (360 / distributor.manufacturers.length) *
                  (Math.PI / 180);
                const x = 100 * Math.cos(angle);
                const y = 100 * Math.sin(angle);

                return (
                  <div key={`manuf-${id}`}>
                    <div
                      className="absolute w-[50px] h-[50px] bg-background rounded-full border-2 border-primary flex items-center justify-center"
                      style={{
                        top: `calc(50% + ${y}px)`,
                        left: `calc(50% + ${x}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div
                      className="absolute bg-primary h-[2px]"
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

              {distributor.products.map((id, index) => {
                const angle =
                  (index * (360 / distributor.products.length) + 180) *
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
