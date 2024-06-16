import React, { useEffect, useState } from 'react';
import { fetchFinances } from './api';

const App = () => {
  const [finances, setFinances] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchFinances();
        console.log('data', data)
        setFinances(data);
      } catch (err) {
        console.error('Error fetching finances data:', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Finances Webpage</h1>
      <ul>
        {finances.map((item) => (
          <li key={item.id}>{/* Display relevant data */}</li>
        ))}
      </ul>
    </div>
  );
};

export default App;