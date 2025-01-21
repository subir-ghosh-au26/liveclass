import React from 'react';
import MeetingRoom from './components/MeetingRoom';
import './css/style.css';
import { MeetingProvider } from './context/MeetingContext';


function App() {
  return (
    <MeetingProvider>
      <div className='app-container'>
        <MeetingRoom />
      </div>
    </MeetingProvider>
  );
}

export default App;