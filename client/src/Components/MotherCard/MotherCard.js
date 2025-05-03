import React, { useState, useRef, useEffect } from "react";
import "./mothercard.css";

const MotherCard = ({ image, title, description, link }) => {
  const cardRef = useRef(null);
  const [style, setStyle] = useState({});
  const [bgStyle, setBgStyle] = useState({});

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e) => {
      const { width, height, left, top } = card.getBoundingClientRect();
      const mouseX = e.clientX - left - width / 2;
      const mouseY = e.clientY - top - height / 2;

      setStyle({
        transform: `rotateY(${(mouseX / width) * 30}deg) rotateX(${-(mouseY / height) * 30}deg)`,
        transition: 'transform 0.1s ease-out',
      });

      setBgStyle({
        transform: `translateX(${-(mouseX / width) * 40}px) translateY(${-(mouseY / height) * 40}px)`,
        backgroundImage: `url(${image})`,
        transition: 'transform 0.1s ease-out',
      });
    };

    const handleMouseLeave = () => {
      setStyle({ transform: "rotateY(0deg) rotateX(0deg)", transition: 'transform 0.3s ease-out' });
      setBgStyle({ transform: "translateX(0) translateY(0)", backgroundImage: `url(${image})`, transition: 'transform 0.3s ease-out' });
    };

    card.addEventListener("mousemove", handleMouseMove);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mousemove", handleMouseMove);
      card.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [image]);

  return (
    <div className="mother-card-wrap" ref={cardRef}>
      <div className="mother-card" style={style}>
        <div className="mother-card-bg" style={bgStyle}></div>
        <div className="mother-card-info">
          {/* Title as a link */}
          <h1><a href={link} target="_blank" rel="noopener noreferrer">{title}</a></h1>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const cards = [
    {
      image: "https://prakharsoftwares.com/assets/images/Online-Registration.jpg",
      title: "New Born Registration",
      description: "Register Through the form",
      link: "/AddMother" 
      
    },
    {
      image: "http://cygnotechlabs.com/wp-content/uploads/2023/11/DA-scaled.jpg",
      title: "View New Born",
      description: "List Of mothers",
      link: "/ViewAllMother"
      
    },
    {
      image: "https://dotnetreport.com/wp-content/uploads/2023/06/17.1-What-Is-Report-Generation-Software-1024x851.png",
      title: "Report Generation",
      description: "Generate Report from here",
      link: "/report-generation"  
    },
  ];
 
  return ( 
    <div className="mother-container">
      <h1 className="mother-title">Welcome to NewBorn Home Page</h1>
      <div className="mother-cards">
        {cards.map((card, index) => (
          <MotherCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}; 




export default App;
