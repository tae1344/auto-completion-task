import React, { useState } from 'react';
import './App.css';
import { Select } from './components/Select';
import { fetchTop100Films } from './data/fetchTop100Films';

function App() {
  const [selectedValue, setSelectedValue] = useState<string>();

  return (
    <div
      style={{
        width: '100vh',
        height: '100vh',
        backgroundColor: '#eee',
      }}
    >
      {/*<Select value={selectedValue} options={top100Films} onChange={(value) => setSelectedValue(value)} />*/}
      <Select value={selectedValue} options={fetchTop100Films} onChange={(value) => setSelectedValue(value)} />
    </div>
  );
}

export default App;
