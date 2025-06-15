"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

gsap.registerPlugin(ScrollTrigger); // ✅ register ScrollTrigger

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const faqs = [
  {
    question: "What is a POS system?",
    answer:
      "A POS (Point of Sale) system is a combination of hardware and software that allows businesses to complete sales transactions, manage inventory, track customer purchases, and generate reports.",
  },
  {
    question: "Is your POS system cloud-based?",
    answer:
      "Yes, it is cloud-based. This allows business owners to access data anytime, anywhere, ensure data backups, and reduce dependency on local hardware.",
  },
  {
    question: "What features does your POS system offer?",
    answer:
      "Our POS system includes real-time inventory tracking, sales reports, customer management, barcode scanning, receipt printing, employee access control, and seamless integration with accounting software.",
  },
];

function FAQItem({ value, question, answer }) {
  return (
    <AccordionItem
      value={value}
      className="rounded-lg border-none bg-white px-4 mt-2 dark:bg-gray-800"
    >
      <AccordionTrigger className="text-lg md:text-xl hover:no-underline hover:text-cyan-700 transition-all dark:text-white">
        {question}
      </AccordionTrigger>
      <AccordionContent className="text-base text-gray-700 dark:text-white">
        {answer}
      </AccordionContent>
    </AccordionItem>
  );
}

export default function FAQAccordion() {
  const [animationData, setAnimationData] = useState(null);
  const faqRef = useRef(null);

  useEffect(() => {
    // Load Lottie JSON
    fetch("/lottieFiles/faqanimation.json")
      .then((res) => res.json())
      .then((data) => setAnimationData(data));

    // GSAP scroll animation
    gsap.fromTo(
      faqRef.current,
      { opacity: 0, y: 50 },
      {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: faqRef.current,
          start: "top 80%", // when top of faqRef is 80% from top of screen
          toggleActions: "play none none none", // play only once
        },
      }
    );
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-16 text-gray-900 dark:text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* FAQ Section */}
        <div ref={faqRef}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold dark:text-blue-400 mb-8">
            Frequently Asked Questions{" "}
            <span className="text-cyan-600 text-4xl sm:text-5xl font-bold">
              ?
            </span>
          </h2>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                value={`item-${index + 1}`}
                question={faq.question}
                answer={faq.answer}
              />
            ))}
          </Accordion>
        </div>

        {/* Lottie Animation */}
        <div className="hidden w-full md:flex justify-center">
          {animationData ? (
            <Lottie
              animationData={animationData}
              loop={false}
              className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg"
            />
          ) : (
            <p className="text-gray-500">Loading animation...</p>
          )}
        </div>
      </div>
    </section>
  );
}
