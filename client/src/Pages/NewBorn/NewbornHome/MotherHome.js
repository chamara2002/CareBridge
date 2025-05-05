import React from 'react';
import FullWidthSlider from '../../../Components/MotherSlider/FullWidthSlider';
import MotherCard from '../../../Components/MotherCard/MotherCard';
import './motherhome.css';

const MotherHome = () => {
    return (
        <div className='mother-home'>
            {/* <Navbar/> */}
            <FullWidthSlider/>
            <MotherCard/>
            {/* <Footer/> */}
        </div>
    );
};

export default MotherHome;