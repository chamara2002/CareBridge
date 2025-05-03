import React from "react";
import feather from "feather-icons";
import './BottomNav.css'

const BottomNav = () => {
  React.useEffect(() => {
    feather.replace();
  }, []);

  return (
    <nav className="slider-mother-12">
      <ul className="slider-mother__menu">
        
        <li className="slider-mother__item">
          <a href="/AddMother" className="slider-mother__link">
            <i data-feather="message-square"></i> <span>Add New Born</span>
          </a>
        </li>

        <li className="slider-mother__item">
          <a href="/ViewAllMother" className="slider-mother__link">
            <i data-feather="folder"></i> <span>View All</span>
          </a>
        </li>
        <li className="slider-mother__item">
          <a href="/report-generation" className="slider-mother__link">
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

export default BottomNav;
