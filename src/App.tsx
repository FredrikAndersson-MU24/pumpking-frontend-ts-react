import {useEffect, useState} from 'react'
import './App.css'

interface Game {
    dayCount: number;
    timeOfDay: number;
    waterScore: Array<number>;
    fertilizerScore: Array<number>;
    weedsScore: number;
    totalScore: number;
    userName?: number;
}

function App() {
    const defaultGame: Game = {
        dayCount: 0,
        timeOfDay: 0,
        waterScore: [],
        fertilizerScore: [],
        weedsScore: 0,
        totalScore: 0,
        userName: undefined
    };

//    const [userName, setUserName] = useState<string>("");
    const [clock, setClock] = useState<string>("");
    const [isActive, setActive] = useState<boolean>(false);
    const [currentGame, setCurrentGame] = useState<Game>(() => {
        try {
            const savedGame = localStorage.getItem('game');
            return savedGame ? JSON.parse(savedGame) : defaultGame;
        } catch (e) {
            console.log(e)
            return defaultGame;
        }
    });
    const {dayCount, timeOfDay, waterScore, fertilizerScore, weedsScore, totalScore} = currentGame;

    const handleResetGame = () => {
        setCurrentGame(defaultGame);
        setActive(false);
        setDay(0);
        setTimeOfDay(0);
        setWaterScore([]);
        setFertilizerScore([]);
        setWeedsScore(0);
        setTotalScore(0);
        console.log(day, timeOfDay, waterScore, fertilizerScore, weedsScore, totalScore);
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
                if (timeOfDay < 7) {
                    setTimeOfDay(prevTime => prevTime + 1);
                } else {
                    setTimeOfDay(0);
                    setDay(prevDay => prevDay + 1);
                }
            };
            if (day < 30) {
                intervalId = setInterval(timeKeeper, 1000); //Fine tune timeout
            }
        }
        return () => clearInterval(intervalId);
    }, [isActive, timeOfDay, day]);

    useEffect(() => {
        switch (timeOfDay) {
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
    }, [timeOfDay]);

    const handleWater = () => {
        setWaterScore((a: number[]) => [...a, timeOfDay,]);
        console.log(waterScore)
    }

    const handleFertilizer = () => {
        setFertilizerScore((a: number[]) => [...a, timeOfDay,]);
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