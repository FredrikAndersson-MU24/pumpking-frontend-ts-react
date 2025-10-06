import {useEffect, useState} from 'react'
import './App.css'

interface Game {
    day: number;
    timeOfDay: number;
    waterScore: Array<number>;
    fertilizerScore: Array<number>;
    weedsScore: number;
    totalScore: number;
    userName: number;
}

function App() {
    const [day, setDay] = useState<number>(0);
    const [time, setTime] = useState<number>(0);
    const [waterScore, setWaterScore] = useState<Array<number>>([]);
    const [fertilizerScore, setFertilizerScore] = useState<Array<number>>([]);
    const [weedsScore, setWeedsScore] = useState<number>(0);
    const [totalScore, setTotalScore] = useState<number>(0);
    const [userName, setUserName] = useState<string>("");
    const [clock, setClock] = useState<string>("");
    const [isActive, setActive] = useState<boolean>(false);

    const handleResetGame = () => {
        setActive(false);
        setDay(0);
        setTime(0);
        setWaterScore([]);
        setFertilizerScore([]);
        setWeedsScore(0);
        setTotalScore(0);
        console.log(day, time, waterScore, fertilizerScore, weedsScore, totalScore);
    }

    const handleStartGame = () => {
        if (!isActive) {
            setActive(prevActive => !prevActive);
            console.log(isActive);
        }
    };

    useEffect(() => {
        let intervalId: number;
        console.log("log from timer")
        if (isActive) {
            const timeKeeper = () => {
                if (time < 7) {
                    setTime(prevTime => prevTime + 1);
                } else {
                    setTime(0);
                    setDay(prevDay => prevDay + 1);
                }
            };
            if (day < 30) {
                intervalId = setInterval(timeKeeper, 1000); //Fine tune timeout
            }
        }
        return () => clearInterval(intervalId);
    }, [isActive, time, day]);

    useEffect(() => {
        switch (time) {
            case 0:
                setClock("00:00");
                break;
            case 1:
                setClock("03:00");
                break;
            case 2:
                setClock("06:00");
                break;
            case 3:
                setClock("09:00");
                break;
            case 4:
                setClock("12:00");
                break;
            case 5:
                setClock("15:00");
                break;
            case 6:
                setClock("18:00");
                break;
            case 7:
                setClock("21:00");
                break;
        }
    }, [time]);

    const handleWater = () => {
        setWaterScore((a: number[]) => [...a, time,]);
        console.log(waterScore)
    }

    const handleFertilizer = () => {
        setFertilizerScore((a: number[]) => [...a, time,]);
        console.log(fertilizerScore)
    }

    return (
        <>
            <p>
                Time: {clock} Days left: {30 - day}
            </p>
            <button onClick={handleResetGame}>Reset</button>
            <button onClick={handleStartGame}>Start</button>
            <button onClick={handleWater}>Water</button>
            <p>Water: {waterScore}</p>
            <button onClick={handleFertilizer}>Fertilize</button>
            <p>Water: {fertilizerScore}</p>
        </>
    )
}

export default App