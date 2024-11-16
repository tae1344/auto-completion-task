import React, { useState } from 'react';
import './App.css';
import { Select } from './components/Select';
import { fetchTop100Films } from './data/fetchTop100Films';
import top100Films from './data/top100Films.json';

function App() {
  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        flexWrap: 'wrap',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 30,
      }}
    >
      <Select options={top100Films} />
      <Select options={fetchTop100Films} />
    </div>
  );
}

export default App;
