"use client"

import  React from "react"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Home} from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse position for the interactive effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

   
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-gradient-to-r from-blue-400/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-500/20 blur-3xl"
            
          />
        ))}
      </div>

      {/* 404 Text */}
      <div
        className="relative text-center mb-8"
        style={{
          transform: `translate(${mousePosition.x * -30}px, ${mousePosition.y * -30}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <h1 className="text-9xl font-extrabold tracking-tighter text-gray-900 dark:text-white">
          <span className="sr-only">Error</span>
          <span className="bg-clip-text text-transparent bg-gradient-to-r bg-error  dark:bg-blue-500">
            404
          </span>
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-md w-full space-y-8 text-center relative z-10">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-[#00ADB5] dark:text-white">Page not found</h2>
          <p className="text-gray-500 dark:text-gray-400">
            The page you&#39;re looking for doesn&#39;t exist or has been moved.
          </p>
        </div>

        {/* Navigation options */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button variant="outline" asChild className="hover:bg-[#00ADB5] border-1 border-[#00ADB5] dark:border-blue-500 dark:hover:bg-blue-500 hover:text-white">
            <Link href="/">
              <Home className="mr-2 h-4 w-4 " />
              Back to home
            </Link>
          </Button>
          <Button variant="outline" onClick={() => window.history.back()} className="hover:bg-[#00ADB5]  border-1 border-[#00ADB5] dark:border-blue-500 cursor-pointer dark:hover:bg-blue-500 hover:text-white text-gray-600 dark:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-center text-sm text-gray-500 dark:text-gray-400">
        Lost? Don&#39;t worry, we all get a little lost sometimes.
      </div>
    </div>
  )
}
