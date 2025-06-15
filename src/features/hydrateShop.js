"use client"

import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { initializeSelectedShop } from "./shopSlice"

export default function HydrateShop() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(initializeSelectedShop())
  }, [dispatch])

  return null
}