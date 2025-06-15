"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import Cookies from 'js-cookie';
import axios from 'axios';
import { setUserInfo } from "@/features/authSlice";

/**
 * PrivateWrapper component that handles authentication and role-based access control
 * Maintains authentication state across page reloads and validates shop owner status
 * 
 * @param {Object} props - Component properties
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string} props.requiredRole - Role required to access the route ('shop_owner', 'employee', etc.)
 * @param {string} props.redirectPath - Path to redirect to if unauthorized (defaults to /login)
 */
const PrivateWrapper = ({
  children,
  requiredRole = null,
  redirectPath = "/authentication"
}) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, userInfo } = useSelector((state) => state.auth);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  // Flag to prevent multiple API calls for shop validation
  const hasValidatedShop = useRef(false);

  useEffect(() => {
    // Check authentication and authorization
    const checkAuth = async () => {
      try {
        // First, ensure we have the most up-to-date user data
        const accessToken = Cookies.get('accessToken');
        
        // If no token, redirect to login
        if (!accessToken) {
          router.push(redirectPath);
          return;
        }
        
        // Try to get user info from storage
        let currentUserInfo = null;
        
        // Try localStorage first
        if (typeof window !== 'undefined') {
          const localStorageUserInfo = localStorage.getItem('userInfo');
          if (localStorageUserInfo) {
            currentUserInfo = JSON.parse(localStorageUserInfo);
          }
        }
        
        // Fallback to cookies
        if (!currentUserInfo) {
          const userInfoFromCookie = Cookies.get('userInfo');
          if (userInfoFromCookie) {
            currentUserInfo = JSON.parse(userInfoFromCookie);
          }
        }
        
        // If we still have user info and Redux state is empty, update Redux once
        if (currentUserInfo && !userInfo) {
          dispatch(setUserInfo(currentUserInfo));
          // Return early to prevent the rest of the effect from running
          // Next render will have userInfo populated
          return;
        }
        
        // Use the most up-to-date user info for subsequent checks
        const effectiveUserInfo = userInfo || currentUserInfo;
        
        // If requiredRole is shop_owner, validate against API only once
        if (requiredRole === 'shop_owner' && !hasValidatedShop.current) {
          try {
            hasValidatedShop.current = true; // Mark as validated to prevent more calls
            
            // Skip API call if we already know they're a shop owner
            if (effectiveUserInfo && effectiveUserInfo.is_shopOwner) {
              setIsAuthorized(true);
              setIsChecking(false);
              return;
            }
            
            const shopsResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}shop/all`, 
              { headers: { Authorization: `Bearer ${accessToken}` } }
            );
            
            const hasActiveShops = shopsResponse.data?.results?.some(shop => shop.is_active === true);
            
            // Update user info if needed
            if (hasActiveShops) {
              // Create updated user info
              const updatedUserInfo = {
                ...(effectiveUserInfo || {}),
                is_shopOwner: true
              };
              
              // Update Redux state once
              dispatch(setUserInfo(updatedUserInfo));
              
              // Since we're updating Redux, return early and let the next effect cycle
              // handle authorization with the updated state
              return;
            }
          } catch (error) {
            console.error("Failed to validate shop owner status:", error);
          }
        }
        
        // If no specific role is required, just being authenticated is enough
        if (!requiredRole) {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }
        
        // Check if user has the required role
        let hasRequiredRole = false;
        
        if (effectiveUserInfo) {
          switch (requiredRole) {
            case 'shop_owner':
              hasRequiredRole = effectiveUserInfo.is_shopOwner;
              break;
            case 'employee':
              hasRequiredRole = effectiveUserInfo.is_employee;
              break;
            // Add other role checks as needed
            default:
              hasRequiredRole = false;
          }
        }
        
        if (hasRequiredRole) {
          setIsAuthorized(true);
        } else {
          // Redirect if user doesn't have the required role
          router.push(effectiveUserInfo ? "/user-profile" : redirectPath);
        }
      } catch (error) {
        console.error("Authentication check failed:", error);
        router.push(redirectPath);
      } finally {
        setIsChecking(false);
      }
    };
    
    checkAuth();
  }, [isAuthenticated, userInfo, requiredRole, router, redirectPath, dispatch]);

  // Show nothing while checking to prevent flash of content
  if (isChecking) {
    return null; // Or a loading spinner
  }

  // Render children only if authorized
  return isAuthorized ? children : null;
};

export default PrivateWrapper;