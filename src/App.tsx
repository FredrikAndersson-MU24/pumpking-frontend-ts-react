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
        console.log(dayCount, timeOfDay, waterScore, fertilizerScore, weedsScore, totalScore);
    }

    const handleTogglePlayPauseGame = () => {
        setActive(prevActive => !prevActive);
        console.log(isActive);
    };

    useEffect(() => {
        if (isActive) {
            localStorage.setItem('game', JSON.stringify(currentGame));
        }
    }, [currentGame, isActive]);

    useEffect(() => {
        let intervalId: number;
        console.log("log from timer")
        if (isActive) {
            const timeKeeper = () => {
                if (currentGame.timeOfDay < 7) {
                    setCurrentGame(prev => ({
                        ...prev,
                        timeOfDay: prev.timeOfDay + 1
                    }));
                } else {
                    setCurrentGame(prev => ({
                        ...prev,
                        timeOfDay: 0,
                        dayCount: prev.dayCount + 1,
                        waterScore: [],
                        fertilizerScore: []
                    }));
                }
            };
            if (currentGame.dayCount < 30) {
                intervalId = setInterval(timeKeeper, 1000); //Fine tune timeout
            }
        }
        return () => clearInterval(intervalId);
    }, [isActive, currentGame.timeOfDay, currentGame.dayCount]);


    useEffect(() => {
        switch (currentGame.timeOfDay) {
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
    }, [currentGame.timeOfDay]);

    const handleWater = () => {
        setCurrentGame(prevState => ({
            ...prevState,
            waterScore: [...prevState.waterScore, prevState.timeOfDay]
        }));
        console.log(waterScore)
    }

    const handleFertilizer = () => {
        setCurrentGame(prevState => ({
            ...prevState,
            fertilizerScore: [...prevState.fertilizerScore, prevState.timeOfDay]
        }));
        console.log(fertilizerScore)
    }

    return (
        <>
            <p>
                Time: {clock} Days left: {30 - currentGame.dayCount}
            </p>
            <button onClick={handleResetGame}>Reset</button>
            <button onClick={handleStartGame}>Start</button>
            <button onClick={handleWater}>Water</button>
            <p>Water: {currentGame.waterScore}</p>
            <button onClick={handleFertilizer}>Fertilize</button>
            <p>Water: {currentGame.fertilizerScore}</p>
        </>
    )
}

export default App