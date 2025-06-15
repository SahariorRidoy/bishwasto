import HeroImageSlider from "@/components/slider/HeroImageSlider";
import WhoCanChoose from "../../components/home/WhoCanChoose";
import Features from "@/components/home/Features";
import SubscriptionSection from "@/components/home/SubscriptionSection";
import Testimonial from "@/components/home/Testimonial";
import FAQAccordion from "@/components/home/FAQAccordion";
import VideoPreviewSection from "@/components/home/VideoPreviewSection";

export default function Home() {
  return (
    <div className="flex dark:bg-background-dark flex-col items-center justify-between overflow-x-hidden">
      <HeroImageSlider />
      <Features/>
      <VideoPreviewSection/>
      <WhoCanChoose />
      <Testimonial />
      <SubscriptionSection/>
      <FAQAccordion/>
    </div>
  );
}