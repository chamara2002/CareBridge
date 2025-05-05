import React from "react";
import feather from "feather-icons";
import './slider.css'

const SliderMother = () => {
  React.useEffect(() => {
    feather.replace();
  }, []);

  return (
    <nav className="slider-mother-12">
      <ul className="slider-mother__menu">
        <li className="slider-mother__item">
          <a href="/registMotherHome" className="slider-mother__link">
            <i data-feather="home"></i> <span>Home</span>
          </a>
        </li>
        <li className="slider-mother__item">
          <a href="/registerMother" className="slider-mother__link">
            <i data-feather="message-square"></i> <span>Add Mother</span>
          </a>
        </li>

        <li className="slider-mother__item">
          <a href="/ViewAllRegmother" className="slider-mother__link">
            <i data-feather="folder"></i> <span>View All</span>
          </a>
        </li>
        <li className="slider-mother__item">
          <a href="/Mreport" className="slider-mother__link">
            <i data-feather="archive"></i> <span>Report</span>
          </a>
        </li>
        <li className="slider-mother__item">
          <a href="#" className="slider-mother__link">
            <i data-feather="help-circle"></i> <span>Help</span>
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default SliderMother;
