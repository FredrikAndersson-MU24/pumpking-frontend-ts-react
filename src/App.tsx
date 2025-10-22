import {useCallback, useEffect, useState} from 'react'
import './App.css'
import axios, {type AxiosResponse} from 'axios'
import api from './api/api'

interface Game {
    id?: number,
    dayCount: number;
    timeOfDay: number;
    waterScore: Array<number>;
    fertilizerScore: boolean;
    weedsScore: number;
    totalScore: number;
    userName?: number;
}

function App() {
    const defaultGame: Game = {
        dayCount: 0,
        timeOfDay: 0,
        waterScore: [],
        fertilizerScore: false,
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
    const [waitingForAPI, setWaitingForAPI] = useState<boolean>(false);
    const [pumpkin, setPumpkin] = useState<string | undefined>(undefined);


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

    const handleDayTick = useCallback(async () => {
        try {
            let response: AxiosResponse;
            if (currentGame.id === undefined) {
                response = await api.post('games/daytick',
                    {
                        "day": currentGame.dayCount,
                        "timeOfDay": currentGame.timeOfDay,
                        "waterScore": currentGame.waterScore,
                        "fertilizerScore": currentGame.fertilizerScore,
                        "weedsScore": 0
                    })
            } else {
                response = await api.post('games/daytick',
                    {
                        "id": currentGame.id,
                        "day": currentGame.dayCount,
                        "timeOfDay": currentGame.timeOfDay,
                        "waterScore": currentGame.waterScore,
                        "fertilizerScore": currentGame.fertilizerScore,
                        "weedsScore": 0
                    })
            }
            const totalScore = response.data.totalScore;
            if (totalScore !== undefined) {
                setCurrentGame(prev => ({
                    ...prev,
                    id: response.data.id,
                    timeOfDay: 0,
                    dayCount: prev.dayCount + 1,
                    waterScore: [],
                    fertilizerScore: false,
                    totalScore: totalScore
                }));
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.log("Error: " + error);
            }
        }
    }, [currentGame]);

    useEffect(() => {
        let intervalId: number;
        console.log("log from timer")
        if (isActive) {
            const timeKeeper = async () => {
                if (currentGame.timeOfDay < 7) {
                    setCurrentGame(prev => ({
                        ...prev,
                        timeOfDay: prev.timeOfDay + 1
                    }));
                } else if (!waitingForAPI) {
                    setWaitingForAPI(true);
                    try {
                        await handleDayTick();
                    } catch (error) {
                        console.error("Failed to handle day tick:", error);
                    } finally {
                        setWaitingForAPI(false);
                    }
                }
            };
            if (currentGame.dayCount < 30) {
                intervalId = setInterval(timeKeeper, 500); //Fine tune timeout
            }
        }
        return () => clearInterval(intervalId);
    }, [isActive, currentGame.timeOfDay, currentGame.dayCount, handleDayTick, waitingForAPI]);


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

    useEffect(() => {
        const pumpkinProgress: string[] = ["src/img/pumpkin_1.png",
            "src/img/pumpkin_2.png",
            "src/img/pumpkin_3.png",
            "src/img/pumpkin_4.png",
            "src/img/pumpkin_5.png",
            "src/img/pumpkin_6.png",
            "src/img/pumpkin_7.png",
            "src/img/pumpkin_8.png"];
        switch (currentGame.dayCount) {
            case 0:
                setPumpkin(undefined);
                break;
            case 1:
                setPumpkin(pumpkinProgress[0]);
                break;
            case 4:
                setPumpkin(pumpkinProgress[1]);

                break;
            case 8:
                setPumpkin(pumpkinProgress[2]);

                break;
            case 12:
                setPumpkin(pumpkinProgress[3]);

                break;
            case 16:
                setPumpkin(pumpkinProgress[4]);

                break;
            case 21:
                setPumpkin(pumpkinProgress[5]);

                break;
            case 26:
                setPumpkin(pumpkinProgress[6]);

                break;
            case 30:
                setPumpkin(pumpkinProgress[7]);

                break;
        }
    }, [currentGame.dayCount]);

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
            fertilizerScore: true
        }));
        console.log(fertilizerScore)
    }

    return (
        <>
            <button onClick={handleResetGame}>Reset</button>
            <div>
                <div className="app">
                    <div className="status-bar">
                        <p>Time: {clock}</p>
                        <p>Days left: {30 - currentGame.dayCount}</p>
                        <p hidden={true}>Total score: {currentGame.totalScore}</p>
                        <p hidden={true}>Water: {currentGame.waterScore}</p>
                        <p hidden={true}>Fertilizer: {currentGame.fertilizerScore}</p>
                    </div>
                    <div className="display">
                        <img className="pumpkin" alt={"pumpkin state"}
                             src={pumpkin} hidden={pumpkin === undefined}>
                        </img>
                    </div>

                    <div className="icon-row">
                        <button onClick={handleWater} disabled={!isActive}
                                style={{backgroundImage: `url('src/img/water_can_1')`}}>Water
                        </button>
                        <button onClick={handleTogglePlayPauseGame}>{isActive ? "=" : ">"}</button>
                        <button onClick={handleFertilizer} disabled={!isActive || currentGame.fertilizerScore}>Fertilize
                        </button>
                    </div>
                </div>

            </div>


        </>
    )
}

export default App