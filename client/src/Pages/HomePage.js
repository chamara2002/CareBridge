import { useState, useEffect } from "react";
import "./HomePage.css";

import image1 from "../Images/image1.jpg";
import image2 from "../Images/image2.jpg";
import image3 from "../Images/image3.jpg";
import image4 from "../Images/image4.jpg";

const images = [image1, image2, image3, image4];

const HomePage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 10000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="homepage">
      <div className="slider">
        {images.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Slide ${index + 1}`}
            className={index === currentIndex ? "active" : ""}
          />
        ))}
        <div className="overlay">
          <h1>Welcome to CareBridge!</h1>
          <p>Connecting Midwifes and Mothers for a Better Tomorrow</p>
        </div>
      </div>
      <section className="home-content">
        <div className="feature-card">
          <h3>Pregnancy Care</h3>
          <p>Access expert advice and support for mothers during pregnancy.</p>
        </div>
        <div className="feature-card">
          <h3>Postpartum Support</h3>
          <p>Get personalized guidance for recovery after childbirth.</p>
        </div>
        <div className="feature-card">
          <h3>Midwife Network</h3>
          <p>Connect with certified midwives in your area for trusted care.</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
