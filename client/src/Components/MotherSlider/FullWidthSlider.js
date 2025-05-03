import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import './motherslider.css'
import image1 from "../../Images/mother1.jpg";
import image2 from "../../Images/image2.jpg";   
import image3 from "../../Images/image3.jpg";  


const FullWidthSlider = () => {
    const images = [
        image1,
        image2,
        image3
      ];

  return (
    <div className="slider-container-mother">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={50}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{ delay: 3000 }}
        loop={true}
      >
        {images.map((img, index) => (
          <SwiperSlide key={index}>
            <img src={img} alt={`Slide ${index + 1}`} className="slide-image-mother" />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default FullWidthSlider;
