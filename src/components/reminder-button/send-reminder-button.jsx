'use client';

import { Send } from "lucide-react";
import toast from "react-hot-toast";

export default function SendReminderButton({ customer }) {
  const handleClick = () => {
    toast.success(`Message sent to ${customer.name}`);
  };

  return (
    <button
      onClick={handleClick}
      title="Send Reminder"
      className="group p-2 cursor-pointer rounded-full bg-white dark:bg-gray-900 hover:bg-teal-100 dark:hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 dark:focus:ring-blue-500 transition-all duration-150 ease-in-out"
    >
      <Send className="w-5 h-5 text-teal-600 dark:text-blue-400 group-hover:scale-110 transform transition-transform duration-150" />
    </button>
  );
}
