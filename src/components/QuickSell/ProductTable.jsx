import React from "react";
import { CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Trash } from "lucide-react";

const ProductTable = ({ items, handlePriceChange, handleQtyChange, handleRemoveItem }) => {
  return (
    <CardContent className="p-4">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead className="w-24">Price</TableHead>
              <TableHead className="w-14">Quantity</TableHead>
              <TableHead className="w-20">Total</TableHead>
              <TableHead className="w-20">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-gray-500">[{item.stock} in stock]</div>
                </TableCell>
                <TableCell>
                  <Input
                    id={`price_${item.id}`}
                    name={`price_${item.id}`}
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]+(\.[0-9]{1,2})?"
                    value={item.price}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.validity.valid || value === "") {
                        handlePriceChange(item.id, value === "" ? 0 : Number(value));
                      }
                    }}
                    required
                    className="w-full text-right text-sm lg:text-base h-10"
                  />
                </TableCell>
                <TableCell>
                  <Input
                    id={`qty_${item.id}`}
                    name={`qty_${item.id}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]+"
                    value={item.qty}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (e.target.validity.valid || value === "") {
                        handleQtyChange(item.id, value === "" ? 1 : Number(value));
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp") {
                        e.preventDefault();
                        handleQtyChange(item.id, Number(item.qty) + 1);
                      } else if (e.key === "ArrowDown") {
                        e.preventDefault();
                        handleQtyChange(item.id, Math.max(1, Number(item.qty) - 1));
                      }
                    }}
                    required
                    className="w-full text-right text-sm lg:text-base h-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </TableCell>
                <TableCell className="font-semibold">
                  ৳{(item.qty * item.price).toFixed(2)}
                </TableCell>
                <TableCell className="flex justify-center items-center h-10">
                  <button onClick={() => handleRemoveItem(item.id)}>
                    <Trash className="text-orange-800 mt-3 hover:text-red-600 cursor-pointer" size={20} />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Card View */}
      <div className="block md:hidden space-y-4">
        {items.map((item) => (
          <div key={item.id} className="border rounded-lg p-4 bg-white shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold text-base">{item.name}</div>
                <div className="text-xs text-gray-500">[{item.stock} in stock]</div>
              </div>
              <button onClick={() => handleRemoveItem(item.id)}>
                <Trash className="text-orange-800 hover:text-red-600 cursor-pointer" size={20} />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm text-gray-600">Price</label>
                <Input
                  id={`price_${item.id}`}
                  name={`price_${item.id}`}
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+(\.[0-9]{1,2})?"
                  value={item.price}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.validity.valid || value === "") {
                      handlePriceChange(item.id, value === "" ? 0 : Number(value));
                    }
                  }}
                  required
                  className="w-full text-right text-sm h-9"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Quantity</label>
                <Input
                  id={`qty_${item.id}`}
                  name={`qty_${item.id}`}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]+"
                  value={item.qty}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (e.target.validity.valid || value === "") {
                      handleQtyChange(item.id, value === "" ? 1 : Number(value));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowUp") {
                      e.preventDefault();
                      handleQtyChange(item.id, Number(item.qty) + 1);
                    } else if (e.key === "ArrowDown") {
                      e.preventDefault();
                      handleQtyChange(item.id, Math.max(1, Number(item.qty) - 1));
                    }
                  }}
                  required
                  className="w-full text-right text-sm h-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
              </div>
            </div>
            <div className="mt-2 text-right">
              <span className="font-semibold text-base">
                Total: ৳{(item.qty * item.price).toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </CardContent>
  );
};

export default ProductTable;