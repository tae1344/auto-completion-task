import React, {useState} from 'react';
import './App.css';
import {Select} from "./components/Select";
import {fetchTop100Films} from "./data/fetchTop100Films";
import top100Films from './data/top100Films.json'

function App() {
    const [selectedValue, setSelectedValue] = useState<string>();
    return (
        <div className="App">
            <div>
                <Select
                    value={selectedValue}
                    options={top100Films}
                    onChange={(value) => setSelectedValue(value)}
                />
                <Select
                    value={selectedValue}
                    options={fetchTop100Films}
                    onChange={(value) => setSelectedValue(value)}
                />
            </div>
        </div>
    );
}

export default App;
