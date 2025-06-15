import React from "react";
import TitleDes from "../common/TitleDes";
import { CheckCircle2 } from "lucide-react";

const reasons = [
  {
    title: "User-Friendly Interface",
    description:
      "Designed for simplicity and efficiency. Easily manage inventory, sales, and reports without a learning curve.",
  },
  {
    title: "Reliable Customer Support",
    description:
      "Our dedicated team is always ready to assist you 24/7 through chat, email, or phone.",
  },
  {
    title: "Highly Customizable",
    description:
      "Tailor the system to fit your unique business needs with flexible modules and features.",
  },
  {
    title: "Secure & Scalable",
    description:
      "Enterprise-grade security with the ability to grow with your business as it expands.",
  },
  {
    title: "Real-Time Analytics",
    description:
      "Get instant insights into your sales, performance, and customer trends to make better decisions.",
  },
  {
    title: "Cloud-Based Access",
    description:
      "Access your POS system from anywhere, anytime — all you need is an internet connection.",
  },
];

const WhyChooseUs = () => {
  return (
    <div className="py-16 px-4 max-w-7xl mx-auto text-gray-800">
      <TitleDes
        title="Why Choose Us"
        description="Discover the benefits of using our POS system"
      />
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
        {reasons.map((reason, idx) => (
          <div
            key={idx}
            className="bg-white p-6 rounded-2xl shadow hover:shadow-md transition"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="text-green-600 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2">{reason.title}</h3>
                <p className="text-gray-600">{reason.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WhyChooseUs;
