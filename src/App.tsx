import {useCallback, useEffect, useState} from 'react'
import './App.css'
import axios, {type AxiosResponse} from 'axios'
import api from './api/api'
import {
    Dialog,
    DialogTitle, DialogContent, Button, DialogActions, TextField
} from "@mui/material";

interface Game {
    id?: number,
    dayCount: number;
    timeOfDay: number;
    waterScore: Array<number>;
    fertilizerScore: boolean;
    weedsScore: number;
    totalScore?: number;
    userName?: string;
}

function App() {
    const defaultGame: Game = {
        dayCount: 0,
        timeOfDay: 0,
        waterScore: [],
        fertilizerScore: false,
        weedsScore: 0
    };

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

    const [openDialog, setOpenDialog] = useState<boolean>(false);
    const [username, setUsername] = useState<string>('');
    const [openResetDialog, setOpenResetDialog] = useState<boolean>(false);

    const handleOpenResetDialog = () => {
        setOpenResetDialog(true);
    };

    const handleCloseResetDialog = () => {
        setOpenResetDialog(false);
    };


    const handleTogglePlayPauseGame = () => {
        setActive(prevActive => !prevActive);
        console.log(isActive);
    };

    useEffect(() => {
        if (isActive) {
            localStorage.setItem('game', JSON.stringify(currentGame));
        }
    }, [currentGame, isActive]);


    const handleDeleteGame = useCallback(async () => {
        try {
            if (currentGame.id === undefined) {
                return;
            } else {
                await api.delete('games/delete/' + currentGame.id)
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.log("Error: " + error);
            }
        }
    }, [currentGame]);

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


    const handleConfirmResetGame = async () => {
        setOpenDialog(false);
        if (!waitingForAPI) {
            setWaitingForAPI(true);
            try {
                await handleDeleteGame();
            } catch (error) {
                console.error("Failed to handle day tick:", error);
            } finally {
                setWaitingForAPI(false);
            }
            setCurrentGame(defaultGame);
            setActive(false);
            console.log(dayCount, timeOfDay, waterScore, fertilizerScore, weedsScore, totalScore);
        }
    }

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
        const pumpkinProgress: string[] = ["src/img/pumpkin/pumpkin_1.png",
            "src/img/pumpkin/pumpkin_2.png",
            "src/img/pumpkin/pumpkin_3.png",
            "src/img/pumpkin/pumpkin_4.png",
            "src/img/pumpkin/pumpkin_5.png",
            "src/img/pumpkin/pumpkin_6.png",
            "src/img/pumpkin/pumpkin_7.png",
            "src/img/pumpkin/pumpkin_8.png"];
        if (currentGame.dayCount === 0) {
            setPumpkin(undefined);
        } else if (currentGame.dayCount === 1) {
            setPumpkin(pumpkinProgress[0]);
        } else if (currentGame.dayCount > 4 && currentGame.dayCount <= 8) {
            setPumpkin(pumpkinProgress[0]);
        } else if (currentGame.dayCount > 8 && currentGame.dayCount <= 12) {
            setPumpkin(pumpkinProgress[0]);
        } else if (currentGame.dayCount > 12 && currentGame.dayCount <= 16) {
            setPumpkin(pumpkinProgress[0]);
        } else if (currentGame.dayCount > 16 && currentGame.dayCount <= 20) {
            setPumpkin(pumpkinProgress[0]);
        } else if (currentGame.dayCount > 20 && currentGame.dayCount <= 25) {
            setPumpkin(pumpkinProgress[0]);
        } else if (currentGame.dayCount > 25 && currentGame.dayCount <= 29) {
            setPumpkin(pumpkinProgress[0]);
        } else if (currentGame.dayCount === 30) {
            setPumpkin(pumpkinProgress[0]);
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
            <img alt="toggle play/pause button"
                 onClick={handleOpenResetDialog}
                 src={'src/img/icons/reset.png'}
            />
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
                        <img className="action-button" alt='water button'
                             src={isActive ? 'src/img/icons/water_can_1.png' : 'src/img/icons/water_can_1_inactive.png'}

                             onClick={isActive ? handleWater : undefined}/>
                        <img className="action-button" alt="toggle play/pause button"
                             onClick={handleTogglePlayPauseGame}
                             src={isActive ? 'src/img/icons/pause.png' : 'src/img/icons/play.png'}
                        />
                        <img className="action-button"
                             alt='fertilize button'
                             src={!fertilizerScore && isActive ? 'src/img/icons/fertilizer_1.png' : 'src/img/icons/fertilizer_1_inactive.png'}
                             onClick={isActive && !fertilizerScore ? handleFertilizer : undefined}/>
                    </div>
                </div>
                <Dialog open={openDialog} onClose={handleCloseResetDialog} sx={{
                    padding: 0,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}>
                    <DialogTitle sx={{backgroundColor: "#ad3e02", color: "white"}}>Reset game </DialogTitle>
                    <DialogContent sx={{backgroundColor: "#ad3e02", color: "white"}}>Are you sure you want to reset the
                        game?
                        <br/>Current progress will be lost.</DialogContent>
                    <DialogActions sx={{
                        backgroundColor: "#ad3e02", justifyContent: "center"
                    }}>
                        <Button onClick={() => handleConfirmResetGame()}
                                sx={{
                                    backgroundColor: "saddlebrown",
                                    color: "lightgreen",
                                    textAlign: "center"
                                }}>YES</Button>
                        <Button onClick={() => handleCloseResetDialog()}
                                sx={{backgroundColor: "saddlebrown", color: "red", textAlign: "center"}} autoFocus>
                            NO
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>


        </>
    )
}

export default App