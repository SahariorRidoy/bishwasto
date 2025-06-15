"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, Check, Loader2 } from "lucide-react";

const SellerAgreementModal = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    setError("");
    
    try {
      const accessToken = Cookies.get("accessToken");
      
      if (!accessToken) {
        router.push("/authentication");
        return;
      }

      // Store agreement acceptance in localStorage
      localStorage.setItem("sellerAgreementAccepted", "true");
      
      // Simulate processing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSuccess) {
        onSuccess({ success: true });
      }
      
      router.push("/shop/request");
      
    } catch (error) {
      console.error("Failed to process agreement:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-[#00ADB5]">Seller Agreement</DialogTitle>
          <DialogDescription>
            Please read and accept before becoming a seller.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Important</h4>
                <p className="text-sm text-amber-700">
                  Once you become a seller, you cannot switch back to a regular user.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Terms and Conditions</h3>
            
            <div className="space-y-2 text-sm">
              <p><strong>1. Permanent Change:</strong> This change to a seller account cannot be reversed.</p>
              
              <p><strong>2. Verification:</strong> You may need to provide ID and business documents.</p>
              
              <p><strong>3. Fees:</strong> You agree to pay platform fees on sales.</p>
              
              <p><strong>4. Content:</strong> You are responsible for all your listings and descriptions.</p>
              
              <p><strong>5. Customer Service:</strong> You must respond to customer questions promptly.</p>
              
              <p><strong>6. Rules:</strong> You must follow all laws and platform policies.</p>
              
              <p><strong>7. Account Status:</strong> We may suspend accounts that break the rules.</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="w-full sm:w-auto"
            disabled={loading}
          >
            Close
          </Button>
          <Button 
            onClick={handleAccept}
            className="w-full sm:w-auto bg-[#00ADB5] hover:bg-[#009199]"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Accept & Continue
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SellerAgreementModal;