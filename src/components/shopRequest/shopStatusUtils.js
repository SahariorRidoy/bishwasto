import Cookies from 'js-cookie'
import axios from 'axios'

/**
 * Fetches the shop request status and sets a cookie for middleware to use
 * Should be called on app initialization or login
 */
export const fetchAndSetShopRequestStatus = async () => {
  try {
    const accessToken = Cookies.get('accessToken')
    
    if (!accessToken) {
      return null
    }
    
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_URL}shop/request/`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
    
    if (response.data && response.data.status) {
      // Set a cookie that the middleware can read
      Cookies.set('shopRequestStatus', response.data.status, { 
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      })
      
      return response.data
    }
    
    // If no shop request, clear the cookie
    Cookies.remove('shopRequestStatus', { path: '/' })
    return null
    
  } catch (error) {
    console.error('Error fetching shop request status:', error)
    
    // If error is 404 (no shop request), clear the cookie
    if (error.response && error.response.status === 404) {
      Cookies.remove('shopRequestStatus', { path: '/' })
    }
    
    return null
  }
}

/**
 * Updates the shop request status cookie
 * Call this when the shop status changes
 */
export const updateShopRequestStatus = (status) => {
  if (status) {
    Cookies.set('shopRequestStatus', status, { 
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    })
  } else {
    Cookies.remove('shopRequestStatus', { path: '/' })
  }
}