import {useEffect, useState, useCallback} from 'react'
import './App.css'
import axios from 'axios'
import api from './api/api'
import {
    Dialog,
    DialogTitle, DialogContent, Button, DialogActions, TextField, TableContainer, Table,
    TableHead, TableRow, TableCell, TableBody, Typography
} from "@mui/material";
import {StyledEngineProvider} from "@mui/material/styles";

interface Game {
    id?: number,
    dayCount: number;
    timeOfDay: number;
    waterScore: Array<number>;
    fertilizerScore: boolean;
    weedsScore: number;
    totalScore: number;
    userName?: string;
}

function App() {
    const defaultGame: Game = {
        totalScore: 0,
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
    const [username, setUsername] = useState<string>('');
    const [openResetDialog, setOpenResetDialog] = useState<boolean>(false);
    const [openEndDialog, setOpenEndDialog] = useState<boolean>(false);
    const [openSaveDialog, setOpenSaveDialog] = useState<boolean>(false);
    const [openLeaderboardDialog, setOpenLeaderboardDialog] = useState<boolean>(false);
    const [leaderboard, setLeaderboard] = useState<Array<Game>>();
    const [lastGameID, setLastGameID] = useState<number>();


    const handleOpenResetDialog = () => {
        setOpenResetDialog(true);
    };

    const handleCloseResetDialog = () => {
        setOpenResetDialog(false);
    };

    const handleOpenEndDialog = () => {
        setOpenEndDialog(true);
    };

    const handleCloseEndDialog = () => {
        setOpenEndDialog(false);
        if (!waitingForAPI) {
            setWaitingForAPI(true);
            try {
                handleDeleteGame();
            } catch (error) {
                console.error("Failed to delete game:", error);
            } finally {
                setWaitingForAPI(false);
            }
            setCurrentGame(defaultGame);
            setActive(false);
        }
    };

    const handleOpenSaveDialog = () => {
        setOpenSaveDialog(true);
        setOpenEndDialog(false);
    };

    const handleCloseSaveDialog = () => {
        setOpenSaveDialog(false);
        if (!waitingForAPI) {
            setWaitingForAPI(true);
            try {
                handleDeleteGame();
            } catch (error) {
                console.error("Failed to delete game:", error);
            } finally {
                setWaitingForAPI(false);
            }
            setCurrentGame(defaultGame);
            setActive(false);
        }
    };

    const handleCloseLeaderboardDialog = () => {
        setOpenLeaderboardDialog(false);
    };

    const handleOpenLeaderboardDialog = () => {
        setOpenLeaderboardDialog(true);
        if (!waitingForAPI) {
            setWaitingForAPI(true);
            try {
                handleGetLeaderboardFromAPI();
            } catch (error) {
                console.error("Failed to delete game:", error);
            } finally {
                setWaitingForAPI(false);
            }
        }
        console.log(leaderboard)
    };


    const handleTogglePlayPauseGame = () => {
        setActive(prevActive => !prevActive);
        console.log(isActive);
    };

    const handleDeleteGame = () => {
        if (currentGame.id === undefined) {
            return;
        } else {
            api.delete('games/delete/' + currentGame.id)
                .then(function () {
                        localStorage.removeItem('game');
                        setCurrentGame(defaultGame);
                        setActive(false);
                    }
                )
                .catch(error => {
                        if (axios.isAxiosError(error)) {
                            console.log("Error: " + error);
                        }
                    }
                )

        }
    };

    const handleDayTick = useCallback(async () => {
        api.post('games/daytick', (currentGame.id === undefined ?
            {
                "day": currentGame.dayCount,
                "timeOfDay": currentGame.timeOfDay,
                "waterScore": currentGame.waterScore,
                "fertilizerScore": currentGame.fertilizerScore,
                "weedsScore": 0
            } : {
                "id": currentGame.id,
                "day": currentGame.dayCount,
                "timeOfDay": currentGame.timeOfDay,
                "waterScore": currentGame.waterScore,
                "fertilizerScore": currentGame.fertilizerScore,
                "weedsScore": 0
            }))
            .then(response => {
                setCurrentGame(prev => (response.data.day === 29 ? {
                    ...prev,
                    id: response.data.id,
                    timeOfDay: 0,
                    dayCount: prev.dayCount + 1,
                    waterScore: [],
                    fertilizerScore: false,
                    totalScore: response.data.totalScore
                } : {
                    ...prev,
                    id: response.data.id,
                    timeOfDay: 0,
                    dayCount: prev.dayCount + 1,
                    waterScore: [],
                    fertilizerScore: false
                }))
            })
            .catch(error => {
                if (axios.isAxiosError(error)) {
                    console.log("Error: " + error);
                }
            })
    }, [currentGame]);

    const handleConfirmResetGame = () => {
        setOpenResetDialog(false);
        if (!waitingForAPI) {
            setWaitingForAPI(true);
            try {
                handleDeleteGame();
            } catch (error) {
                console.error("Failed to handle delete game:", error);
            } finally {
                setWaitingForAPI(false);
            }
            setCurrentGame(defaultGame);
            setActive(false);
            console.log(dayCount, timeOfDay, waterScore, fertilizerScore, weedsScore, totalScore);
        }
    }

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

    const handleSaveGameToAPI = () => {
        setLastGameID(currentGame.id);
        api.post("/games/saveAtEndOfGame",
            {
                "id": currentGame.id,
                "day": currentGame.dayCount,
                "timeOfDay": currentGame.timeOfDay,
                "waterScore": currentGame.waterScore,
                "fertilizerScore": currentGame.fertilizerScore,
                "weedsScore": 0,
                "userName": username
            }).then(response => {
            setLeaderboard(response.data);
            setOpenSaveDialog(false);
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                console.log("Error: " + error);
            }
        }
    }

    const handleGetLeaderboardFromAPI = () => {
        api.get('/games/finished').then(response => {
            setLeaderboard(response.data);
            console.log(response.data);
        }).catch(error => console.log(error));
    }

    useEffect(() => {
        if (isActive) {
            localStorage.setItem('game', JSON.stringify(currentGame));
        }
    }, [currentGame, isActive]);

    useEffect(() => {
        if (currentGame.dayCount === 30) {
            handleOpenEndDialog();
        }
    }, [currentGame.dayCount]);

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
            setPumpkin(pumpkinProgress[1]);
        } else if (currentGame.dayCount > 8 && currentGame.dayCount <= 12) {
            setPumpkin(pumpkinProgress[2]);
        } else if (currentGame.dayCount > 12 && currentGame.dayCount <= 16) {
            setPumpkin(pumpkinProgress[3]);
        } else if (currentGame.dayCount > 16 && currentGame.dayCount <= 20) {
            setPumpkin(pumpkinProgress[4]);
        } else if (currentGame.dayCount > 20 && currentGame.dayCount <= 25) {
            setPumpkin(pumpkinProgress[5]);
        } else if (currentGame.dayCount > 25 && currentGame.dayCount <= 29) {
            setPumpkin(pumpkinProgress[6]);
        } else if (currentGame.dayCount === 30) {
            setPumpkin(pumpkinProgress[7]);
        }
    }, [currentGame.dayCount]);

    return (
        <>
            <StyledEngineProvider injectFirst>
                <div className="app">
                    <header style={{textAlign: "center", fontSize: "2.4rem"}}>Pumpking</header>
                    <div className={"top-icon-row"}>
                        <img alt="reset button"
                             onClick={handleOpenResetDialog}
                             src={'src/img/icons/reset.png'}
                        />
                        <button onClick={handleOpenLeaderboardDialog}>High scores</button>
                    </div>
                    <div className="status-bar">
                        <div className="status">
                            <p>Time:</p>
                            <h2>{clock}</h2>
                        </div>
                        <div className="status">
                            <p>Days left</p>
                            <h2>{30 - currentGame.dayCount}</h2>
                        </div>
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
                <Dialog open={openResetDialog} sx={{
                    padding: 0,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}>
                    <DialogTitle
                        className={'dialog-element'}>Reset game </DialogTitle>
                    <DialogContent
                        className={'dialog-element'}>
                        Are you sure you want to reset the
                        game?
                        <br/>Current progress will be lost.</DialogContent>
                    <DialogActions className={'dialog-element'}
                                   sx={{justifyContent: "center"}}>
                        <Button onClick={() => handleConfirmResetGame()}
                                sx={{
                                    backgroundColor: "saddlebrown",
                                    color: "lightgreen",
                                    textAlign: "center"
                                }}>YES</Button>
                        <Button onClick={() => handleCloseResetDialog()}
                                sx={{backgroundColor: "saddlebrown", color: "red", textAlign: "center"}}>
                            NO
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openEndDialog} sx={{
                    padding: 0,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}>
                    <DialogTitle
                        className={'dialog-element'}>The day is finally
                        here...</DialogTitle>
                    <DialogContent
                        className={'dialog-element'}>
                        After all your hard work it's time for the annual harvest market pumpkin competition.
                        <br/> You've managed to grow a pumpkin with a total weight
                        of <b>{(currentGame.totalScore / 1000).toFixed(3)} kgs</b>.
                        <br/>
                        <br/>Would you like to add your score to the leaderboard?
                    </DialogContent>
                    <DialogActions
                        className={'dialog-element'}
                        sx={{justifyContent: "center"}}>
                        <Button onClick={() => handleOpenSaveDialog()}
                                sx={{
                                    backgroundColor: "saddlebrown",
                                    color: "lightgreen",
                                    textAlign: "center"
                                }}>YES</Button>
                        <Button onClick={() => handleCloseEndDialog()}
                                sx={{backgroundColor: "saddlebrown", color: "red", textAlign: "center"}}>
                            NO
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog open={openSaveDialog} sx={{
                    padding: 0,
                    marginLeft: "auto",
                    marginRight: "auto",
                }}>
                    <DialogTitle className={'dialog-element'}>Save game</DialogTitle>
                    <DialogContent className={'dialog-element'}>
                        Please enter your name:
                    </DialogContent>
                    <TextField required={true} onChange={(e) =>
                        setUsername(e.target.value)}></TextField>
                    <DialogActions sx={{
                        backgroundColor: "#ad3e02", justifyContent: "center"
                    }}>
                        <Button onClick={() => handleSaveGameToAPI()}
                                sx={{
                                    backgroundColor: "saddlebrown",
                                    color: "lightgreen",
                                    textAlign: "center"
                                }}>Save</Button>
                        <Button onClick={() => handleCloseSaveDialog()}
                                sx={{backgroundColor: "saddlebrown", color: "red", textAlign: "center"}}>
                            Cancel
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog className={'dialog'} open={openLeaderboardDialog}>
                    <DialogTitle className={'dialog-element'}>Leaderboard</DialogTitle>
                    {leaderboard === undefined ?
                        <Typography> No entries</Typography> :
                        <TableContainer sx={{maxHeight: 200, overflow: "auto"}}>
                            <Table stickyHeader size="small">
                                <TableHead>
                                    <TableRow className={'dialog-element'}>
                                        <TableCell className={'dialog-element'}>#</TableCell>

                                        <TableCell className={'dialog-element'}
                                                   sortDirection={"desc"}>Score</TableCell>
                                        <TableCell className={'dialog-element'} align="right">Name</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>

                                        {leaderboard.sort((a: Game, b: Game) => b.totalScore - a.totalScore).map((item: Game) => (
                                            <TableRow
                                                key={item.id}>
                                                <TableCell align="right">{item.totalScore}</TableCell>
                                                <TableCell component="th" scope="row">
                                                    "{item.userName}"
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        }
                        <DialogActions sx={{justifyContent: "center"}} className={'dialog-element'}>
                            <Button onClick={() => handleCloseLeaderboardDialog()}
                                    sx={{backgroundColor: "saddlebrown", color: "black", textAlign: "center"}}>
                                Close
                            </Button>
                        </DialogActions>
                    </Dialog>
                </div>
            </StyledEngineProvider>
        </>
    )
}

export default App