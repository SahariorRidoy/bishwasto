'use client'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

export default function Error({ reset }) {
 
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-white dark:bg-gray-900">
      {/* Error Indicator */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-[#00ADB5] dark:text-blue-500 tracking-tight">
          Something went wrong
        </h1>
      </div>

      {/* Content */}
      <div className="max-w-md w-full space-y-6 text-center">
        <div className="space-y-2">
          
          <p className="text-gray-500 dark:text-gray-400">
            We encountered an unexpected issue. Please try again or return to the homepage.
          </p>
          
        </div>

        {/* Recovery Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            onClick={() => reset()}
            className=" cursor-pointer bg-[#00ADB5] dark:bg-blue-500 dark:hover:bg-blue-700 text-white hover:bg-[#008C93]"
          >
            Try Again
          </Button>
          <Button variant="outlined" onClick={() => window.history.back()} className="hover:bg-[#00ADB5] border-1 border-[#00ADB5] dark:border-blue-500 cursor-pointer dark:hover:bg-blue-500 hover:text-white text-gray-600 dark:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go back
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
        Need help? Contact our support team.
      </div>
    </div>
  )
}