import {useEffect, useState} from 'react'
import './App.css'

interface Game {
    day: number;
    timeOfDay: number;
    waterScore: Array<number>;
    fertilizerScore: number;
    weedsScore: number;
    totalScore: number;
    userName: number;
}

function App() {
    const [day, setDay] = useState<number>(0);
    const [time, setTime] = useState<number>(0);
    const [waterScore, setWaterScore] = useState<Array<number>>([]);
    const [fertilizerScore, setFertilizerScore] = useState<number>(0);
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
        setFertilizerScore(0);
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

    return (
        <>
            <p>
                Time: {clock} Days left: {30 - day}
            </p>
            <button onClick={handleResetGame}>Reset</button>
            <button onClick={handleStartGame}>Start</button>
        </>
    )
}

export default App