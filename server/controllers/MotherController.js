const Mother = require('..mother'); 


const createMother = async (req, res) => {
  try {
    const { 
      motherId, 
      fullName, 
      dateOfBirth, 
      phoneNumber, 
      bloodType, 
      height, 
      weight, 
      prePregnancyWeight 
    } = req.body;

  
    if (!motherId || !fullName || !dateOfBirth || !phoneNumber || !bloodType || !height || !weight || !prePregnancyWeight) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

  
    const existingMother = await Mother.findOne({ motherId });
    if (existingMother) {
      return res.status(400).json({ message: 'Mother ID already exists.' });
    }

   
    const newMother = new Mother({
      motherId,
      fullName,
      dateOfBirth,
      phoneNumber,
      bloodType,
      height,
      weight,
      prePregnancyWeight
    });

    const savedMother = await newMother.save();
    res.status(201).json({ message: 'Mother registered successfully', data: savedMother });
  } catch (error) {
    console.error('Error adding mother:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

const getAllMothers = async (req, res) => {
  try {
    const mothers = await Mother.find();
    res.status(200).json(mothers);
  } catch (error) {
    console.error('Error fetching mothers:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


const getMotherById = async (req, res) => {
  try {
    const { motherId } = req.params;
    const mother = await Mother.findOne({ motherId });

    if (!mother) {
      return res.status(404).json({ message: 'Mother not found' });
    }

    res.status(200).json(mother);
  } catch (error) {
    console.error('Error fetching mother:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


const updateMother = async (req, res) => {
  try {
    const { motherId } = req.params;
    const updatedMother = await Mother.findOneAndUpdate(
      { motherId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedMother) {
      return res.status(404).json({ message: 'Mother not found' });
    }

    res.status(200).json({ message: 'Mother updated successfully', data: updatedMother });
  } catch (error) {
    console.error('Error updating mother:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


const deleteMother = async (req, res) => {
  try {
    const { motherId } = req.params;
    const deletedMother = await Mother.findOneAndDelete({ motherId });

    if (!deletedMother) {
      return res.status(404).json({ message: 'Mother not found' });
    }

    res.status(200).json({ message: 'Mother deleted successfully' });
  } catch (error) {
    console.error('Error deleting mother:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};


const getNextMotherId = async () => {
    try {
      const lastMother = await Mother.findOne().sort({ motherId: -1 });
  
      let nextId = "M001"; 
      if (lastMother) {
       
        const lastNumber = parseInt(lastMother.motherId.substring(1), 10);
        nextId = `M${String(lastNumber + 1).padStart(3, "0")}`;
      }
  
      return nextId; 
    } catch (error) {
      console.error("Error generating next MotherId:", error);
      throw error;
    }
  };
  
  const getNextMotherIdHandler = async (req, res) => {
    try {
      const nextId = await getNextMotherId(); 
      res.status(200).json({ nextId }); 
    } catch (error) {
      res.status(500).json({ message: 'Error generating next MotherId.' });
    }
  };

module.exports = { createMother, getAllMothers, getMotherById, updateMother, deleteMother,getNextMotherIdHandler };
