import { useState } from 'react'
import './App.css'

interface Game{
    day: number;
    timeOfDay: number;
    waterScore: number;
    fertilizerScore: number;
    weedsScore: number;
    totalScore: number;
    userName: number;
}

function App() {
    const [day, setDay] = useState(0);
    const [time, setTime] = useState(0);
    const [waterScore, setWaterScore] = useState(0);
    const [fertilizerScore, setFertilizerScore] = useState(0);
    const [weedsScore, setWeedsScore] = useState(0);
    const [totalScore, setTotalScore] = useState(0);
    const [userName, setUserName] = useState(0);

const handleStartNewGame = () => {
    setDay(0);
    setTime(0);
    setWaterScore(0);
    setFertilizerScore(0);
    setWeedsScore(0);
    setTotalScore(0);
    console.log(day, time, waterScore, fertilizerScore, weedsScore, totalScore);
    }


  return (
    <>
        <button onClick={handleStartNewGame}>Start</button>
    </>
  )
}

export default App
