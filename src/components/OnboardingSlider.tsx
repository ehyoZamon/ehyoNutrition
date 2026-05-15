"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import Image from 'next/image'

import "swiper/css";
import "swiper/css/pagination";

import "@/styles/onboarding.css";

const slides = [
  {
    title: "Eat Healthy",
    text: "Maintaining good health should be the primary focus of everyone.",
    image: "/walkthrough/slide1.svg",
  },
  {
    title: "Healthy Recipes",
    text: "Browse thousands of healthy recipes from all over the world.",
    image: "/walkthrough/slide2.svg",
  },
  {
    title: "Track Your Health",
    text: "With amazing inbuilt tools you can track your progress.",
    image: "/walkthrough/slide3.svg",
  },
];

export default function OnboardingSlider() {
  return (
    <div className="onboarding">
      <Swiper
        modules={[Pagination]}
        pagination={{ clickable: true }}
        spaceBetween={30}
        slidesPerView={1}
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index}>
            <div className="slide">
              <Image
                src={slide.image}
                alt={slide.title}
                className="slide-image"
                width={282}
                height={282}
              />

              <h2>{slide.title}</h2>

              <p>{slide.text}</p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}