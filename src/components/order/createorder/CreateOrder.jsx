"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";


const availableProducts = [
  {
    id: 3,
    itemNo: "003",
    name: "ibuprofeno 200mg",
    price: 25,
    qty: 1,
    discount: 0,
    stock: 15,
  },
  {
    id: 4,
    itemNo: "004",
    name: "termómetro digital",
    price: 120,
    qty: 1,
    discount: 0,
    stock: 5,
  },
  {
    id: 5,
    itemNo: "005",
    name: "guantes quirúrgicos",
    price: 45,
    qty: 1,
    discount: 0,
    stock: 25,
  },
];

const defaultTransaction = {
  shop: 1,
  customer_phone_number: "",
  name: "",
  subtotal: 0.0,
  grand_total: 0.0,
  discount: 0.0,
  amount_paid: 0.0,
  amount_change: 0.0,
  note: "",
  due: 0.0,
  method: "Cash",
  items: [],
};
const customers = [
  { phone: "01711112222", name: "Alice" },
  { phone: "01833334444", name: "Bob" },
  { phone: "01955556666", name: "Charlie" },
];
const CreateOrder = () => {
  const [items, setItems] = useState();
  const [searchTerm, setSearchTerm] = useState("");
  const [transaction, setTransaction] = useState(defaultTransaction);
  const [phoneSearchTerm, setPhoneSearchTerm] = useState("");

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
    setItems([...items, product]);
    setSearchTerm("");
  };

  const handleCalculateTotals = () => {
    const newSubtotal = items.reduce(
      (sum, item) => sum + item.qty * item.price,
      0
    );
    const newGrandTotal = items.reduce(
      (sum, item) => sum + item.qty * item.price * (1 - item.discount / 100),
      0
    );
    const newDiscount = newSubtotal - newGrandTotal;

    const updatedTransaction = {
      ...transaction,
      subtotal: newSubtotal,
      grand_total: newGrandTotal,
      discount: newDiscount,
      amount_change: Math.max(transaction.amount_paid - newGrandTotal, 0),
      due: Math.max(newGrandTotal - transaction.amount_paid, 0),
      items: items.map((item) => ({
        product_stock: item.id,
        quantity: item.qty,
        discount_type: "percentage",
        discount_total: item.qty * item.price * (item.discount / 100),
        total_discounted_amount:
          item.qty * item.price * (1 - item.discount / 100),
      })),
    };

    setTransaction(updatedTransaction);
  };

  return (
    <div className="w-full mt-20 flex-1 flex gap-4 justify-between md:flex-row flex-col px-4 py-6 lg:flex-row  rounded-lg">
      <Card className="backdrop-blur-sm border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-primarytext">
            Create Order
          </CardTitle>
          <div className="relative">
            <div className="w-full flex flex-col relative">
              <Input
                className="border-none px-3 mt-5 py-2 bg-transparent focus:ring-0"
                placeholder=" Item Name or scan Barcode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <div className="absolute top-10 z-10 w-full -md rounded border mt-6 max-h-40 overflow-y-auto dark:bg-gray-700 bg-gray-300">
                  {availableProducts
                    .filter((p) =>
                      p.name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-2 dark:hover:bg-gray-300/30 hover:bg-gray-200 cursor-pointer"
                        onClick={() => handleAddProductToTransaction(p)}
                      >
                        {p.name} - ৳{p.price}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-9 text-center">Del</TableHead>
                <TableHead className="w-28">Item #</TableHead>
                <TableHead>Item Name</TableHead>
                <TableHead className="w-20">Price</TableHead>
                <TableHead className="w-14">Qty</TableHead>
                <TableHead className="w-28">Disc</TableHead>
                <TableHead className="w-20">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center align-top">
                    <button onClick={() => handleRemoveItem(item.id)}>
                      <Trash
                        className="text-blue-800 hover:text-red-600 cursor-pointer"
                        size={20}
                      />
                    </button>
                  </TableCell>
                  <TableCell>{item.itemNo}</TableCell>
                  <TableCell>
                    <div className="font-semibold">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      [{item.stock} in stock]
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      value={item.price}
                      onChange={(e) =>
                        handlePriceChange(item.id, Math.max(0, Number(e.target.value)))
                      }
                      className="w-16 text-right"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={1}
                      value={item.qty}
                      onChange={(e) =>
                        handleQtyChange(item.id, Math.max(1, Number(e.target.value)))
                      }
                      className="w-14 text-right"
                    />
                  </TableCell>
                  <TableCell className="flex items-center gap-1 w-32">
                    <Input
                      type="number"
                      min={0}
                      step={0.01}
                      value={item.discount}
                      onChange={(e) =>
                        handleDiscountChange(item.id, Math.max(0, Number(e.target.value)))
                      }
                      className="w-14 text-right"
                    />
                    <span className="rounded px-2 py-1 dark:bg-red-600/50 bg-gray-300 text-xs font-medium">
                      %
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ৳
                    {(
                      item.qty *
                      item.price *
                      (1 - item.discount / 100)
                    ).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-sm border -lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold dark:text-primarytext">
            Order Summary
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="w-full flex-shrink-0">
            <div className="mb-4">

              <div className="relative grid grid-cols-2 gap-4 items-center">
                <span className="font-semibold dark:text-white text-gray-700">
                  Phone Number
                </span>
                <div className="relative w-full">
                  <Input
                    type="text"
                    className="w-full"
                    value={phoneSearchTerm || transaction.customer_phone_number}
                    required
                    onChange={(e) => setPhoneSearchTerm(e.target.value)}
                    placeholder="Enter customer phone no.a"
                  />
                  {phoneSearchTerm && (
                    <div className="absolute z-10 bg-white dark:bg-gray-800 border rounded w-full -md max-h-40 overflow-y-auto">
                      {customers
                        .filter((c) => c.phone.includes(phoneSearchTerm))
                        .map((c, index) => (
                          <div
                            key={index}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                            onClick={() => {
                              handleTransactionFieldChange("customer_phone_number", c.phone);
                              setPhoneSearchTerm(""); // ✅ closes suggestion popup
                            }}
                          >
                            {c.name} - {c.phone}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <span className="font-semibold dark:text-white text-gray-700">
                  Note
                </span>
                <Textarea
                  id="note"
                  placeholder="Add note about this order"
                  value={transaction.note}
                  onChange={(e) =>
                    handleTransactionFieldChange("note", e.target.value)
                  }
                  className="min-h-[70px] w-full"
                />
              </div>
            </div>

            <div className="border-b my-2" />

            <div className="flex justify-between text-lg font-bold border-b pb-2 mb-2">
              <span>Grand Total</span>
              <span>{transaction.grand_total.toFixed(2)}</span>
            </div>

            <div className="grid grid-cols-2 gap-4 items-center text-sm pb-4">
              <span>Amount Paid</span>
              <Input
                type="number"
                className="w-full"
                min={0}
                value={transaction.amount_paid}
                onChange={(e) =>
                  handleTransactionFieldChange(
                    "amount_paid",
                    Number(e.target.value)
                  )
                }
              />

              <span>Due</span>
              <Input
                type="number"
                className="w-full"
                min={0}
                value={transaction.due}
                onChange={(e) =>
                  handleTransactionFieldChange("due", Number(e.target.value))
                }
              />
            </div>

            <div className=" grid grid-cols-2 gap-4 items-center text-sm">
              <span>Payment Method</span>
              <Select
                value={transaction.method}
                className=" truncate"
                onValueChange={(value) =>
                  handleTransactionFieldChange("method", value)
                }
              >
                <SelectTrigger id="method">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Card">Card</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="mt-4">
              <Button
                className="w-full text-white bg-green-600 hover:bg-green-700"
                onClick={handleCalculateTotals}
              >
                Calculate Totals
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateOrder;
