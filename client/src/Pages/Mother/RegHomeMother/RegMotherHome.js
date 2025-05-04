import React from 'react';
import Navbar from '../../../Components/Navbar';
import Footer from '../../../Components/Footer';
import FullWidthSlider from '../../../Components/MotherSlider/FullWidthSlider';
import RegisterMotherCard from '../../../Components/MotherCard/RegisterMotherCard';

const RegMotherHome = () => {
    return (
        <div>
            <Navbar/>
            <FullWidthSlider/>
            <RegisterMotherCard/>
            <Footer/>
        </div>
    );
};

export default RegMotherHome;