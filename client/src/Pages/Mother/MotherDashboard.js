import MotherMenu from './MotherMenu';

const MotherDash = () => {
  return (
    <MotherMenu>
      <h1>Welcome to the Mother Dashboard</h1>
      <div className="stats">
        <div className="card">Total Appointments: 12</div>
        <div className="card">New Messages: 5</div>
        <div className="card">Midwives Connected: 8</div>
      </div>

      <h2>Recent Activities</h2>
      <ul className="activities">
        <li>New appointment scheduled with Dr. Smith</li>
        <li>Message from Midwife Jane Doe</li>
        <li>Updated profile information</li>
      </ul>
    </MotherMenu>
  );
};

export default MotherDash;
