"use client";
import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const PlanCard = ({ plan, isAnnual }) => {
  const cardRef = useRef(null);
  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
  const isCustom = price === '—';

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: cardRef.current,
            start: 'top 90%',
          },
        }
      );
    }
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group h-full relative rounded-xl p-6 flex flex-col justify-between border shadow-md transition-all duration-500
        hover:scale-110 hover:shadow-lg
        ${plan.highlighted
          ? 'bg-white dark:bg-blue-600/10'
          : 'bg-white dark:bg-blue-600/10 border dark:border-blue-400/20'}
      `}
    >
      {plan.badge && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[var(--color-background-teal)] text-white text-xs px-3 py-1 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {plan.badge}
        </div>
      )}

      <div className="flex-grow flex flex-col items-start">
        <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-blue-400">{plan.name}</h3>
        <p className="text-sm text-gray-600 dark:text-blue-100">{plan.description}</p>

        <div className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">
          {!isCustom ? `BDT ${price}` : '—'}
          {!isCustom && (
            <span className="text-base font-medium text-gray-500 dark:text-blue-100">
              {isAnnual ? ' /year' : ' /month'}
            </span>
          )}
        </div>
        <p className="text-sm text-green-600 mt-1">
          {isCustom ? plan.annualTotal : isAnnual && plan.annualTotal ? `Billed annually (${plan.annualTotal})` : 'Billed monthly'}
        </p>

        <ul className="mt-4 space-y-2 text-sm text-left w-full">
          {plan.features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-gray-700 dark:text-blue-100">
              <span className="text-green-600 font-bold">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button className="mt-6 w-full py-2 px-4 text-sm font-semibold rounded transition-colors duration-300 bg-[var(--color-background-teal)] text-white hover:bg-teal-500 hover:cursor-pointer hover:text-white dark:bg-blue-600/20 dark:text-blue-400 dark:hover:bg-blue-500 dark:hover:text-white">
        {plan.buttonText}
      </button>
    </div>
  );
};

export default PlanCard;