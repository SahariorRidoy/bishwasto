'use client'
import React, { useEffect, useRef } from 'react'
import {
    LuBadgeDollarSign,
    LuBox,
    LuLaptop,
    LuLayoutDashboard,
    LuShieldCheck,
    LuSmile,
} from 'react-icons/lu'
import TitleDes from '../common/TitleDes'
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const Features = () => {
    const featuresRef = useRef([]);
    const titleRef = useRef(null);
    const descriptionRef = useRef(null);

    const features = [
        {
            icon: <LuBox className="w-8 h-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
            title: 'Suitable For All Business',
            description:
                'Retail, restaurants, services, or wholesale – our POS system fits all industries with ease and flexibility.',
        },
        {
            icon: <LuBadgeDollarSign className="w-8 h-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
            title: 'Cost Effective & Affordable',
            description:
                'Packed with powerful features at a budget-friendly price, designed for various type of shops.',
        },
        {
            icon: <LuLaptop className="w-8 h-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
            title: 'No IT Knowledge Required',
            description:
                'Effortless setup with a friendly interface. Anyone can manage operations without technical skills.',
        },
        {
            icon: <LuLayoutDashboard className="w-8 h-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
            title: 'Modern & Sleek Dashboard',
            description:
                'Streamlined UI built for productivity, quick actions, and at-a-glance performance insights.',
        },
        {
            icon: <LuShieldCheck className="w-8 h-8 dark:text-blue-400 text-[var(--color-background-primary)]" />,
            title: 'Reliable & Secure',
            description:
                'Keep your business and customer data safe with enterprise-level security and automatic backups.',
        },
    ];

    useEffect(() => {
        const featureElements = featuresRef.current;

        gsap.fromTo(
            titleRef.current,
            { x: -50 },
            {
                x: 0,
                duration: 0.4,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                },
            }
        );

        gsap.fromTo(
            descriptionRef.current,
            { x: -30 },
            {
                x: 0,
                duration: 0.4,
                ease: 'power3.out',
                delay: 0.1,
                scrollTrigger: {
                    trigger: descriptionRef.current,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    toggleActions: 'play none none reverse',
                },
            }
        );

        featureElements.forEach((el, index) => {
            gsap.fromTo(
                el,
                { x: -200 },
                {
                    x: 0,
                    duration: 0.3,
                    ease: 'power3.out',
                    delay: 0.1 + index * 0.05,
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 80%',
                        end: 'bottom 20%',
                        toggleActions: 'play none none reverse',
                    },
                }
            );
        });

        return () => {
            ScrollTrigger.killAll();
        };
    }, []);

    return (
        <section className="py-16 mt-6">
            <div className="container mx-auto px-4">
                <TitleDes
                    title="Key Features of Bishwasto"
                    description="Discover the core features that make our POS system the go-to solution for businesses aiming to grow smarter."
                    titleRef={titleRef}
                    descriptionRef={descriptionRef}
                />

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 sm:gap-8 lg:gap-10">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            ref={(el) => (featuresRef.current[index] = el)}
                            className="group cursor-default bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 hover:-translate-y-1 dark:bg-card flex flex-col items-center justify-center"
                        >
                            <div className="mb-4 p-4 rounded-full dark:bg-blue-600/20 bg-[var(--color-background-teal)] shadow-md inline-flex items-center justify-center">
                                {feature.icon}
                            </div>
                            <h3 className="text-lg text-center font-semibold dark:text-blue-400 text-[var(--color-secondarytext-light)] group-hover:text-[var(--color-primary)] transition-colors duration-200 mb-2">
                                {feature.title}
                            </h3>
                            <p className="dark:text-blue-100 max-w-xs text-[var(--color-secondarytext-light)] leading-relaxed text-md text-center">
                                {feature.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default Features;