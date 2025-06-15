import React from 'react'
import { FaLaptop } from "react-icons/fa";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from '../ui/button'
import { LuMoon, LuSun } from 'react-icons/lu';
import { useTheme } from 'next-themes';

const ThemeButton = () => {
      const { setTheme } = useTheme()
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button className={'hover:transition-all duration-300 hover:scale-105 cursor-pointer'} variant="outline" size="icon">
                    <LuSun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
                    <LuMoon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-48 p-4 rounded-xl shadow-xl dark:bg-background-dark bg-white mr-2">
                <p className="text-sm font-medium mb-2">Select Theme</p>
                <div className="flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        className="justify-start cursor-pointer"
                        onClick={() => setTheme("light")}
                    >
                        <LuSun className="h-[1.2rem] w-[1.2rem]  text-amber-500" />
                        Light
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-start cursor-pointer"
                        onClick={() => setTheme("dark")}
                    >
                        <LuMoon className=' text-blue-400'/> Dark
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-start cursor-pointer"
                        onClick={() => setTheme("system")}
                    >
                        <FaLaptop className=" text-gray-500" /> System
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default ThemeButton
