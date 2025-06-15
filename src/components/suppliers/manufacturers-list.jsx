"use client";

import { useEffect, useState } from "react";
import {
  Building2,
  MapPin,
  Mail,
  Package2,
  Truck,
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ManufacturerDetail } from "@/components/suppliers/manufacturer-detail";
import { Label } from "recharts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useGetInventoryProductsQuery } from "@/features/productsApiSlice";
import axios from "axios";
import Cookies from "js-cookie";

export function ManufacturersList() {
  const [selectedManufacturer, setSelectedManufacturer] = useState(null);
  const [open, setOpen] = useState(false);
  const [productSelectOpen, setProductSelectOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [error, setError] = useState(null);
  const [manufacturers, setManufacturers] = useState([]);


  const { data: products, isLoading } = useGetInventoryProductsQuery();


  const handleAddManufacturer = (event) => {
    console.log("object");
  };


  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}product_supplier/manufacturers/`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${Cookies.get("accessToken")}`,
            },
          }
        );
        setManufacturers(response.data.results);
        setError(null);
        console.log(response.data.results);
      } catch {
        setError("Failed to load distributors.");
      }
    };
    fetchManufacturers();
  }, []);

  
  return (
    <div>
      {selectedManufacturer ? (
        <ManufacturerDetail
          manufacturer={selectedManufacturer}
          onBack={() => setSelectedManufacturer(null)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 mt-4">
            <h2 className="text-2xl font-bold">Manufacturers</h2>
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
                <form onSubmit={handleAddManufacturer}>
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

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {manufacturers.map((manufacturer) => (
              <Card
                key={manufacturer.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedManufacturer(manufacturer)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    {manufacturer.name}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {manufacturer.address}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm mb-4">
                    <Mail className="h-4 w-4" />
                    {manufacturer.contact_info}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Package2 className="h-3 w-3" />
                      {manufacturer.products.length} Products
                    </Badge>
                    <Badge
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      <Truck className="h-3 w-3" />
                      {/* {manufacturer.distributors.length} Distributors */}
                    </Badge>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => setSelectedManufacturer(manufacturer)}
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
