// features/shopSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  selectedShop: null,
  shops: [],
};

export const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setSelectedShop: (state, action) => {
      state.selectedShop = action.payload;
      // Optionally save to localStorage for persistence across page refreshes
      localStorage.setItem("selectedShop", JSON.stringify(action.payload));
    },
    
    setShops: (state, action) => {
      state.shops = action.payload;
    },
  },
});

export const { setSelectedShop,  setShops } = shopSlice.actions;

// // Async thunk to fetch shop details and update Redux
// export const selectShopById = (shopId) => async (dispatch, getState) => {
//   try {
//     const accessToken = localStorage.getItem("accessToken") || "";
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}shop/${shopId}/`,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch shop details");
//     }

//     const shopData = await response.json();
//     dispatch(setSelectedShop(shopData));
//     return shopData;
//   } catch (error) {
//     console.error("Error selecting shop:", error);
//     throw error;
//   }
// };

// Initialize the shop from localStorage when the app starts
export const initializeSelectedShop = () => (dispatch) => {
  try {
    const savedShop = localStorage.getItem("selectedShop");
    if (savedShop) {
      dispatch(setSelectedShop(JSON.parse(savedShop)));
    }
  } catch (error) {
    console.error("Failed to initialize shop from localStorage:", error);
    localStorage.removeItem("selectedShop");
  }
};

export default shopSlice.reducer;