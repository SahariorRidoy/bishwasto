"use client";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import CustomSliderBackground from "./CustomSliderBackground";
const HeroImageSlider = () => {
    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        vertical: false,
        verticalSwiping: false,
        rtl: false,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true,
    };
    return (
        <div className=" h-full md:mt-16 -mt-3 max-w-screen overflow-x-hidden">
            <Slider {...settings}>
                <CustomSliderBackground 
                image={"hero/hero1.jpg"} 
                title1={"Sell Smarter, "} 
                title2={" Not Harder"} 
                description={`Upgrade to a powerful POS system that simplifies sales, tracks inventory,  and grows with your business—whether you're online, offline, or both.`}  />

                <CustomSliderBackground 
                image={"hero/hero2.jpg"} 
                title1={"Your Business, "} 
                title2={"Fully in Control"} 
                description={"From real-time analytics to effortless checkout, manage every aspect of your store in one sleek platform. Join sellers who’ve already made the switch."} 
                />
                <CustomSliderBackground 
                image={"hero/hero3.jpg"} 
                title1={"Start Selling in "} 
                title2={"Minutes"}
                description={" No complicated setup. Just register, add your products, and start selling with a modern POS that works as fast as you do."} 
                 />
            </Slider>
        </div>
    );
};

export default HeroImageSlider;
