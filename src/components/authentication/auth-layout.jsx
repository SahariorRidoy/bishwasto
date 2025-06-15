import React from "react";
import { Smartphone } from "lucide-react";

export function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center dark:bg-gray-900 p-4">
      <div className="mb-8 flex flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00ADB5] dark:bg-gray-800">
          <Smartphone className="h-8 w-8 text-white" />
        </div>
        <h1 className="mt-4 text-2xl font-bold">Bishwasto</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Secure authentication with your phone number
        </p>
      </div>
      {children}
    </div>
  );
}
