"use client"


import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Package2, TruckIcon, CreditCard, FileText, Tag, ShoppingCart } from "lucide-react";
import Link from "next/link";

// Mock data for wholesale products
const mockWholesaleProducts = [
  {
    id: 1,
    name: "Product A",
    sku: "SKU-001",
    regularPrice: 100,
    price: { 
      tier1: 90, // 1-9 units
      tier2: 85, // 10-49 units
      tier3: 80, // 50+ units
    },
    moq: 5, // Minimum order quantity
    inStock: 200,
    category: "Category 1"
  },
  {
    id: 2,
    name: "Product B",
    sku: "SKU-002",
    regularPrice: 150,
    price: {
      tier1: 135,
      tier2: 127.50,
      tier3: 120,
    },
    moq: 10,
    inStock: 350,
    category: "Category 2"
  },
  {
    id: 3,
    name: "Product C",
    sku: "SKU-003",
    regularPrice: 200,
    price: {
      tier1: 180,
      tier2: 170,
      tier3: 160,
    },
    moq: 3,
    inStock: 75,
    category: "Category 1"
  },
  {
    id: 4,
    name: "Product D",
    sku: "SKU-004",
    regularPrice: 120,
    price: {
      tier1: 108,
      tier2: 102,
      tier3: 96,
    },
    moq: 8,
    inStock: 120,
    category: "Category 3"
  },
];

// Mock data for wholesale orders
const mockWholesaleOrders = [
  {
    id: "WH-1001",
    date: "2023-04-10",
    customer: "Acme Corporation",
    total: 4250.00,
    status: "Completed",
    paymentTerms: "Net 30",
    items: 12
  },
  {
    id: "WH-1002",
    date: "2023-04-15",
    customer: "XYZ Enterprises",
    total: 3800.00,
    status: "Processing",
    paymentTerms: "Net 60",
    items: 8
  },
  {
    id: "WH-1003",
    date: "2023-04-18",
    customer: "Global Trading Co.",
    total: 6700.00,
    status: "Pending Payment",
    paymentTerms: "Net 30",
    items: 15
  },
];

const Wholesale = () => {
  const [cart, setCart] = useState([]);
  
  const [quantities, setQuantities] = useState({});
  
  // Add product to cart with appropriate tier pricing
  const addToCart = (productId) => {
    const quantity = quantities[productId] || 0;
    if (quantity <= 0) return;
    
    const product = mockWholesaleProducts.find(p => p.id === productId);
    if (!product) return;
    
    // Determine price tier based on quantity
    let tier = "tier1";
    let price = product.price.tier1;
    
    if (quantity >= 50) {
      tier = "tier3";
      price = product.price.tier3;
    } else if (quantity >= 10) {
      tier = "tier2";
      price = product.price.tier2;
    }
    
    // Check if product is already in cart
    const existingIndex = cart.findIndex(item => item.productId === productId);
    
    if (existingIndex >= 0) {
      // Update existing cart item
      const updatedCart = [...cart];
      updatedCart[existingIndex] = {
        ...updatedCart[existingIndex],
        quantity,
        tier,
        price
      };
      setCart(updatedCart);
    } else {
      // Add new cart item
      setCart([...cart, {
        productId,
        quantity,
        tier,
        price
      }]);
    }
    
    // Reset quantity input
    const updatedQuantities = {...quantities};
    delete updatedQuantities[productId];
    setQuantities(updatedQuantities);
  };
  
  const removeFromCart = (productIddark) => {
    setCart(cart.filter(item => item.productId !== productId));
  };
  
  const getProductById = (iddark) => {
    return mockWholesaleProducts.find(product => product.id === id);
  };
  
  const calculateTotal = () => {
    return cart.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };
  
  const handleQuantityChange = (productIddark, value) => {
    const quantity = parseInt(value, 10) || 0;
    setQuantities({
      ...quantities,
      [productId]: quantity
    });
  };
  
  return (
    <div className=" py-8">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-primarytext">Wholesale Portal</h1>
      
      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-8">
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package2 className="w-4 h-4" />
            <span>Products</span>
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            <span>Orders</span>
          </TabsTrigger>
          <TabsTrigger value="cart" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span>Cart ({cart.length})</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-primarytext">Wholesale Products</CardTitle>
              <CardDescription>
                Browse our wholesale catalog with tiered pricing. Minimum order quantities apply.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center md:flex-row flex-col mb-4">
                <div className="flex items-center md:flex-row flex-col gap-4">
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="category1">Category 1</SelectItem>
                      <SelectItem value="category2">Category 2</SelectItem>
                      <SelectItem value="category3">Category 3</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select defaultValue="instock">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Stock Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="instock">In Stock</SelectItem>
                      <SelectItem value="lowstock">Low Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className=" md:mt-0 mt-4">
                  <Input type="text" placeholder="Search products..." className="w-[250px]" />
                </div>
              </div>
              
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>MOQ</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead className="text-right">1-9 Units</TableHead>
                    <TableHead className="text-right">10-49 Units</TableHead>
                    <TableHead className="text-right">50+ Units</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWholesaleProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.moq}</TableCell>
                      <TableCell>
                        <span className={product.inStock < 100 ? "text-amber-500" : ""}>
                          {product.inStock}
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold"><span className=" pr-1">৳</span> {product.price.tier1.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold"><span className=" pr-1">৳</span> {product.price.tier2.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold"><span className=" pr-1">৳</span> {product.price.tier3.toFixed(2)}</TableCell>
                      <TableCell className="w-[150px]">
                        <Input 
                          type="number" 
                          min={product.moq}
                          placeholder={`Min: ${product.moq}`}
                          value={quantities[product.id] || ""}
                          onChange={(e) => handleQuantityChange(product.id, e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="outline"
                          onClick={() => addToCart(product.id)}
                          disabled={!quantities[product.id] || quantities[product.id] < product.moq}
                        >
                          Add
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-primarytext">Your Wholesale Orders</CardTitle>
              <CardDescription>
                Manage and track your wholesale orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Payment Terms</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockWholesaleOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.items}</TableCell>
                      <TableCell>{order.paymentTerms}</TableCell>
                      <TableCell className="text-right">৳{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={
                          order.status === "Completed" 
                            ? "px-2 py-1 bg-green-100 text-green-800 rounded text-xs"
                            : order.status === "Processing"
                            ? "px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs"
                            : "px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs"
                        }>
                          {order.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="cart">
          <Card>
            <CardHeader>
              <CardTitle className="dark:text-primarytext">Wholesale Cart</CardTitle>
              <CardDescription>
                Review your wholesale order before checkout
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cart.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Your cart is empty. Add products from the Products tab.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price Tier</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cart.map((item) => {
                      const product = getProductById(item.productId);
                      if (!product) return null;
                      
                      return (
                        <TableRow key={item.productId}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>
                            {item.tier === "tier1" ? "Tier 1 (1-9)" : 
                             item.tier === "tier2" ? "Tier 2 (10-49)" : 
                             "Tier 3 (50+)"}
                          </TableCell>
                          <TableCell className="text-right">৳{item.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">৳{(item.price * item.quantity).toFixed(2)}</TableCell>
                          <TableCell>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => removeFromCart(item.productId)}
                              className="text-red-500"
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
              
              {cart.length > 0 && (
                <div className="mt-8 flex flex-col gap-4">
                  <div className="flex justify-between items-center py-2 border-t border-b">
                    <span className="font-bold">Total:</span>
                    <span className="font-bold">৳{calculateTotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="paymentTerms">Payment Terms</Label>
                        <Select defaultValue="net30">
                          <SelectTrigger id="paymentTerms">
                            <SelectValue placeholder="Select payment terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="net30">Net 30</SelectItem>
                            <SelectItem value="net60">Net 60</SelectItem>
                            <SelectItem value="net90">Net 90</SelectItem>
                            <SelectItem value="immediate">Immediate Payment</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="shippingMethod">Shipping Method</Label>
                        <Select defaultValue="standard">
                          <SelectTrigger id="shippingMethod">
                            <SelectValue placeholder="Select shipping method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="standard">Standard Shipping</SelectItem>
                            <SelectItem value="express">Express Shipping</SelectItem>
                            <SelectItem value="freight">Freight Shipping</SelectItem>
                            <SelectItem value="pickup">Pickup</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Order Notes</Label>
                      <Input id="notes" placeholder="Add any special instructions" />
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-4 mt-4">
                    <Button variant="outline">Save Quote</Button>
                    <Button>Proceed to Checkout</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-primarytext">Sales Analytics</CardTitle>
                <CardDescription>
                  Monitor your wholesale business performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md dark:bg-card-bg bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">Monthly Sales</div>
                      <div className="text-2xl font-bold dark:text-primarytext">৳42,580</div>
                      <div className="text-xs text-green-600">↑ 12% from last month</div>
                    </div>
                    <div className="p-4 border rounded-md  dark:bg-card-bg bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">Average Order Value</div>
                      <div className="text-2xl font-bold dark:text-primarytext">৳4,250</div>
                      <div className="text-xs text-green-600">↑ 5% from last month</div>
                    </div>
                    <div className="p-4 border rounded-md  dark:bg-card-bg bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">Active Customers</div>
                      <div className="text-2xl font-bold dark:text-primarytext">24</div>
                      <div className="text-xs text-red-600">↓ 2% from last month</div>
                    </div>
                    <div className="p-4 border rounded-md  dark:bg-card-bg bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">Order Frequency</div>
                      <div className="text-2xl font-bold dark:text-primarytext">1.8/mo</div>
                      <div className="text-xs text-green-600">↑ 8% from last month</div>
                    </div>
                  </div>
                  
                  <div className="h-60 flex items-center border justify-center dark:bg-card-bg bg-gray-100 rounded-md">
                    <div className="text-gray-400">Sales Chart Placeholder</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="dark:text-primarytext">Inventory Status</CardTitle>
                <CardDescription>
                  Monitor stock levels for wholesale products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border rounded-md dark:bg-card-bg bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">Total SKUs</div>
                      <div className="text-2xl font-bold dark:text-primarytext">126</div>
                    </div>
                    <div className="p-4 border rounded-md dark:bg-card-bg bg-gray-50">
                      <div className="text-sm text-gray-500 mb-1">Low Stock Items</div>
                      <div className="text-2xl font-bold text-amber-600">12</div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Low Stock Alerts</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-right">Current Stock</TableHead>
                          <TableHead className="text-right">Reorder Point</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell>Product C</TableCell>
                          <TableCell className="text-right text-amber-600">75</TableCell>
                          <TableCell className="text-right">100</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Product E</TableCell>
                          <TableCell className="text-right text-amber-600">42</TableCell>
                          <TableCell className="text-right">50</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell>Product G</TableCell>
                          <TableCell className="text-right text-red-600">18</TableCell>
                          <TableCell className="text-right">50</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="h-[120px] flex items-center justify-center dark:bg-card-bg bg-gray-100 rounded-md">
                    <div className="text-gray-400">Inventory Chart Placeholder</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button variant="outline">Generate Inventory Report</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="mt-8 flex justify-end">
        <Link href="/dashboard">
          <Button variant="outline">Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default Wholesale;
