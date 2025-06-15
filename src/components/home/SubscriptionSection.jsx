"use client"
import React, { useState } from 'react';
import TitleDes from '../common/TitleDes';
import PlanCard from './PlanCard';

const plans = [
  {
    name: 'Starter',
    description: 'Perfect for small businesses just getting started',
    monthlyPrice: 150,
    annualPrice: 1500,
    annualTotal: 'BDT 1500/year',
    features: [
      'Single register',
      'Basic inventory management',
      'Cloud backups',
      'Email support',
      'Basic reporting',
    ],
    buttonText: 'Start with Starter',
    highlighted: false,
    badge: 'Great for Starters',
  },
  {
    name: 'Professional',
    description: 'Ideal for growing businesses with multiple employees',
    monthlyPrice: 200,
    annualPrice: 2000,
    annualTotal: 'BDT 2000/year',
    features: [
      'Up to 3 registers',
      'Advanced inventory management',
      'Customer loyalty program',
      '24/7 support',
      'Advanced analytics',
      'Employee management',
      'Hardware compatibility',
    ],
    buttonText: 'Choose Professional',
    highlighted: true,
    badge: 'Most Popular',
  },
  {
    name: 'Enterprise',
    description: 'For established businesses with multiple locations',
    monthlyPrice: 400,
    annualPrice: 4000,
    annualTotal: 'BDT 4000/year',
    features: [
      'Unlimited registers',
      'Multi-location support',
      'API access',
      'Dedicated account manager',
      'Custom reporting',
      'Advanced security features',
      'E-commerce integration',
      'White-label options',
    ],
    buttonText: 'Contact Sales',
    highlighted: false,
    badge: 'Best for Scale',
  },
  {
    name: 'Custom Plan',
    description: 'Tailored solutions for your unique business needs',
    monthlyPrice: '—',
    annualPrice: '—',
    annualTotal: 'Let’s Talk to Customize Plan',
    features: [
      'Fully customizable',
      'Dedicated solution expert',
      'Integration support',
      'Priority support',
      'Enterprise security',
    ],
    buttonText: 'Get Custom Plan',
    highlighted: false,
    badge: 'Let’s Customize',
  },
];


const SubscriptionSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <TitleDes title={'Transparent Pricing for Every Business'} description={'Choose the perfect plan for your business needs'} />

        {/* Toggle */}
        <div className="flex justify-center mt-6 items-center gap-3">
          <span className="text-sm text-gray-700 dark:text-blue-100">Monthly</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isAnnual}
              onChange={() => setIsAnnual(!isAnnual)}
              className="sr-only peer"
            />
            <div className="w-12 h-6 bg-gray-300 rounded-full peer peer-checked:bg-[var(--color-background-teal)] dark:bg-blue-600/20 dark:peer-checked:bg-blue-400"></div>
            <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 peer-checked:translate-x-6"></div>
          </label>
          <span className="text-sm text-green-600 font-medium">
            Annually <span className="bg-green-100 text-green-700 dark:bg-green-600/20 dark:text-green-400 px-2 py-0.5 rounded-full text-xs">Save 20%</span>
          </span>
        </div>

        {/* Plan Cards */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <PlanCard key={idx} plan={plan} isAnnual={isAnnual} />
          ))}
        </div>

        <p className="text-sm text-gray-600 dark:text-blue-100 mt-6">
          Need a custom solution?{' '}
          <a href="#" className="text-blue-600 dark:text-blue-400 underline">Contact our sales team</a>
        </p>
      </div>
    </div>
  );
};

export default SubscriptionSection;
