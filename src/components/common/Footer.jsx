import Link from "next/link";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="text-white py-10  pt-24 bg-[#00ADB5] dark:bg-gray-950 px-4">
      <div className="w-full container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 ">
          {/* Company Info */}
          <div className="md:px-6 lg:mx-0 md:col-span-2 md:pr-8">
            <h3 className="md:col-span-2 text-2xl font-semibold mb-4">
              Zero Byte
            </h3>
            <p className="text-gray-200">
              Empowering your business with seamless POS and e-commerce
              solutions. Explore our diverse range of products and services
              through our image gallery. Each image tells a story of quality, in
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-200 hover:text-white transition"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/shop"
                  className="text-gray-200 hover:text-white transition"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-200 hover:text-white transition"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-200 hover:text-white transition"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/faq"
                  className="text-gray-200 hover:text-white transition"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-gray-200 hover:text-white transition"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-gray-200 hover:text-white transition"
                >
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-gray-200 hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Socials */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
            <p className="text-gray-200 mb-4">
              Email: 0byte.xyz@gmail.com
              <br />
              Phone: +88 017 1234 5678
            </p>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook className="text-gray-200 hover:text-white h-6 w-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaTwitter className="text-gray-200 hover:text-white h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="text-gray-200 hover:text-white h-6 w-6" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedin className="text-gray-200 hover:text-white h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 text-center">
          <p className="text-gray-200">
            © {new Date().getFullYear()} Zero Byte. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}