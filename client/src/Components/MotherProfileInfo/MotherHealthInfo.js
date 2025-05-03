import React from "react";
import { FaSyringe, FaHeartbeat } from "react-icons/fa";
import './profileMother.css'

const MotherHealthInfo = () => {
  const vaccinationHistory = [
    { vaccineName: "Tetanus", date: "2024-10-10T00:00:00Z" },
    { vaccineName: "Flu Shot", date: "2024-12-05T00:00:00Z" },
    { vaccineName: "Hepatitis B", date: "2023-08-15T00:00:00Z" },
  ];

  const medicalHistory = {
    existingConditions: ["Gestational Diabetes", "Hypertension"],
    allergies: ["Penicillin", "Peanuts"],
    medications: ["Folic Acid", "Iron Supplements"],
  };

  return (
    <div className="mother-history-container">
      {/* Vaccination Records */}
      <div className="mother-history-card">
        <h3 className="vaccination-header">
          <FaSyringe /> Vaccination Records
        </h3>
        <ul className="vaccination-list">
          {vaccinationHistory.map((vaccine, index) => (
            <li className="li-mother-profile" key={index}>
              <strong>{vaccine.vaccineName}:</strong> {new Date(vaccine.date).toLocaleDateString()}
            </li>
          ))}
        </ul>
      </div>

      {/* Medical History */}
      <div className="mother-history-card">
        <h3 className="vaccination-header">
          <FaHeartbeat /> Medical History
        </h3>
        <p>
          <strong>Existing Conditions:</strong> {medicalHistory.existingConditions.join(", ")}
        </p>
        <p>
          <strong>Allergies:</strong> {medicalHistory.allergies.join(", ")}
        </p>
        <p>
          <strong>Medications:</strong> {medicalHistory.medications.join(", ")}
        </p>
      </div>
    </div>
  );
};

export default MotherHealthInfo;
