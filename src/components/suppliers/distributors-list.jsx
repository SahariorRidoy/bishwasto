"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Truck,
  MapPin,
  Phone,
  Package2,
  Building2,
  Plus,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DistributorDetail } from "@/components/suppliers/distributor-detail";
import Cookies from "js-cookie";
import { useGetInventoryProductsQuery } from "@/features/productsApiSlice";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

export function DistributorsList() {
  const [selectedDistributor, setSelectedDistributor] = useState(null);
  const [open, setOpen] = useState(false);
  const [distributors, setDistributors] = useState([]);
  const [error, setError] = useState(null);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [productSelectOpen, setProductSelectOpen] = useState(false);
  const { data: products, isLoading } = useGetInventoryProductsQuery();

  useEffect(() => {
    const fetchDistributors = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}product_supplier/distributors/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          }
        );
        setDistributors(response.data.results);
        setError(null);
      } catch {
        setError("Failed to load distributors.");
      }
    };
    fetchDistributors();
  }, []);

  const handleAddDistributor = async (e) => {
    e.preventDefault();
    const { name, address, contact_info, manufacturers } = e.target;

    const manufacturerIds = manufacturers.value
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
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}product_supplier/distributors/`,
        {
          name: name.value,
          address: address.value,
          contact_info: contact_info.value,
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
      setDistributors((prev) => [...prev, response.data]);
      setSelectedProductIds([]);
      setOpen(false);
      e.target.reset();
      toast.success("Distributor added successfully!");
    } catch {
      setError("Failed to add distributor.");
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <div>
      {selectedDistributor ? (
        <DistributorDetail
          distributor={selectedDistributor}
          onBack={() => setSelectedDistributor(null)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 mt-4">
            <h2 className="text-2xl font-bold">Distributors</h2>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00ADB5] hover:bg-[#589ea1] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Distributor
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Distributor</DialogTitle>
                  <DialogDescription>
                    Enter distributor details.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddDistributor}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="e.g., XYZ Distributors"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="e.g., 67890 Distribution Zone, New York"
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="contact_info">Contact Info</Label>
                      <Input
                        id="contact_info"
                        name="contact_info"
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
                        <PopoverContent className="w-[300px] p-0">
                          <Command shouldFilter={true}>
                            <CommandInput placeholder="Search products..." />
                            <CommandList>
                              {isLoading ? (
                                <CommandEmpty>Loading products...</CommandEmpty>
                              ) : !products?.results?.length ? (
                                <CommandEmpty>No products found.</CommandEmpty>
                              ) : (
                                <CommandGroup>
                                  {products.results.map((product) => (
                                    <CommandItem
                                      key={product.id}
                                      value={product.product_name}
                                      onSelect={() =>
                                        handleProductSelect(product.id)
                                      }
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedProductIds.includes(
                                            product.id
                                          )
                                            ? "opacity-100"
                                            : "opacity-0"
                                        )}
                                      />
                                      {product.product_name}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              )}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="manufacturers">Manufacturer IDs</Label>
                      <Input
                        id="manufacturers"
                        name="manufacturers"
                        placeholder="e.g., 1,2"
                        required
                      />
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
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
                      Add Distributor
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {distributors.length === 0 && !error && (
            <p className="text-gray-500 mb-4">No distributors found.</p>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {distributors.map((distributor) => (
              <Card
                key={distributor.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedDistributor(distributor)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    {distributor.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {distributor.address}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Phone className="h-4 w-4" />
                    {distributor.contact_info}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Package2 className="h-3 w-4" />
                      {distributor.products.length} Products
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Building2 className="h-3 w-3" />
                      {distributor.manufacturers.length} Manufacturers
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setSelectedDistributor(distributor)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
