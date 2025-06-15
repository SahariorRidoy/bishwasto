'use client'

import {
  LuScissors,
  LuShoppingCart,
  LuStore,
  LuTruck,
  LuUtensils
} from 'react-icons/lu'
import React from 'react'
import TitleDes from '../common/TitleDes'

const WhoCanChoose = () => {
  const industries = [
    {
      icon: <LuStore className="size-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
      title: 'Retail & Local Shops',
      description:
        'Manage product listings, hybrid shopping experiences, and real-time inventory — perfect for clothing, electronics, and convenience stores.',
    },
    {
      icon: <LuUtensils className="size-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
      title: 'Restaurants & Food Services',
      description:
        'Handle table reservations, QR menu ordering, dine-in/pickup/delivery options, and kitchen inventory seamlessly.',
    },
    {
      icon: <LuShoppingCart className="size-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
      title: 'Online & Hybrid Sellers',
      description:
        'Synchronize your online and in-store sales, track availability, and offer flexible delivery or in-store pickup to boost customer satisfaction.',
    },
    {
      icon: <LuStore className="size-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
      title: 'Wholesale & B2B Suppliers',
      description:
        'Enable tiered pricing, bulk orders, and streamlined wholesale management for suppliers and distributors.',
    },
    {
      icon: <LuTruck className="w-10 h-10 dark:text-blue-400 text-[var(--color-background-primary)]" />,
      title: 'Logistics & Delivery Services',
      description:
        'Integrate delivery partners, optimize routes, and enable real-time tracking for retail and food businesses.',
    },
    {
      icon: <LuScissors className="size-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
      title: 'Personal Services & Appointments',
      description:
        'Barbershops, salons, and repair centers can schedule appointments, manage staff.',
    },
  ]

  return (
    <section className="py-16 ">
      <div className="container mx-auto px-4">
        <TitleDes
          title={'Who Benefits from Bishwasto?'}
          description={'Our versatile platform adapts to the unique needs of diverse industries, providing tailored solutions that grow with your business.'}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-6">
          {industries.map((industry, index) => (
            <div
              key={index}
              className="dark:bg-blue-600/10 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 flex flex-col items-start border dark:border-blue-400/20"
            >
              <div className="mb-2 p-3 dark:bg-blue-600/10 bg-[var(--color-background-teal)] rounded-lg">
                {industry.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2 dark:text-blue-400">
                {industry.title}
              </h3>
              <p className="dark:text-blue-100 text-gray-600">{industry.description}</p>
            </div>
          ))}
        </div>
      </div>

    </section>
  )
}

export default WhoCanChoose
