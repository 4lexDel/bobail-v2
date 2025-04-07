import { useEffect, useRef, useState } from 'react';
import './connect4Canvas.css';
import Swal from 'sweetalert2';
import { CanvasGame } from '../../utils/canvas/CanvasGame';
import Connect4Game, { Cell } from '../../games/Connect4/Connect4Game';
import { Action } from '../../games/Connect4/Connect4MontecarloImplementation';
import { Settings } from '../Header/Header';

const createWorker = () => new Worker(
    new URL('../../workers/connect4.worker.js', import.meta.url),
    { type: 'module' }
);

const Connect4Canvas = ({ settings }: { settings: Settings }) => {
    const canvasRef = useRef(null);
    const [backgroundColor, setBackgroundColor] = useState("tomato");

    const connect4Game = new Connect4Game();
    let game: CanvasGame;

    let newWorker: Worker | null = null;

    let isAlgorithmProcessing = false;

    const reflexionTimeRef = useRef<number>(settings.reflexionTime);

    useEffect(() => {
        if (!canvasRef.current) return;
        game = new CanvasGame(canvasRef.current, connect4Game.getGrid());
        game.onCellClicked = handleCellClick;
        game.onCellHover = handleCellHover;
    }, []);

    const handleCellHover = (x: number, _: number) => {
        const column = Array.from({ length: 6 }, (_, i) => ({ x, y: i }));
        game.resetFlagGrid();
        game.editFlagGrid(column, CanvasGame.HOVER);
    }

    const handleCellClick = (x: number, _: number) => {
        if (isAlgorithmProcessing || connect4Game.isGameOver()) return;
        game.resetFlagGrid();

        if(!connect4Game.isColumnFull(x)) {
            if(checkWinner()) return;
            processMove(x);
        }
    };

    useEffect(() => {
        reflexionTimeRef.current = settings.reflexionTime;
    }, [settings]);

    const processMove = (column: number) => {
        if (connect4Game.movePiece(column)) {
            setBackgroundColor(connect4Game.getCurrentPlayer() === 1 ? "tomato" : "lightskyblue");
            updateGameGrid(connect4Game.getGrid());

            resetWorker();
            if (newWorker) {
                newWorker.onmessage = (event) => {
                    // AI answer
                    handleWorkerOnMessage(event);
                }               

                isAlgorithmProcessing = true;
                newWorker.postMessage({ grid: connect4Game.getGrid(), player: connect4Game.getCurrentPlayer(), reflexionTime: reflexionTimeRef.current });
            }
        }
        
        checkWinner();
    };

    const handleWorkerOnMessage = (event: MessageEvent<any>) => {
        const { nextAction }: { nextAction: Action } = event.data;

        if (nextAction) {
            connect4Game.movePiece(nextAction.column);
            const grid = connect4Game.getGrid();

            updateGameGrid(grid);

            processAiPostMove();
        }
    }

    const processAiPostMove = () => {
        setBackgroundColor(connect4Game.getCurrentPlayer() === 1 ? "tomato" : "lightskyblue");
        isAlgorithmProcessing = false;

        connect4Game.checkGameOver();
        return checkWinner();
    }

    const resetWorker = () => {
        if (newWorker) newWorker.terminate();
        newWorker = createWorker();
    }

    const updateGameGrid = (newGrid: Cell[][]) => {
        connect4Game.setGrid(newGrid);
        game.setGrid(newGrid);
    }

    const checkWinner = () => {
        if (!connect4Game.isGameOver()) return false; 

        const message = connect4Game.getWinner() === 0 ? "This game is a draw!" : `Player ${connect4Game.getWinner()} has won!`;
        let color = connect4Game.getWinner() === 1 ? "red" : "blue";
        if(connect4Game.getWinner() === 0) color = "black";

        setTimeout(() => {
            Swal.fire({
                title: "Game over",
                html: `<span style="font-weight: bold; color: ${color}">${message}</span>`,
                icon: "success",
                allowEscapeKey: false,
                allowOutsideClick: false,
                showDenyButton: true,
                confirmButtonText: "Restart",
                denyButtonText: "Close",
            }).then(({ isConfirmed }) => {
                if (isConfirmed) {
                    isAlgorithmProcessing = false;
                    connect4Game.initGame();
                    game.setGrid(connect4Game.getGrid());
                }
            });
        }, 500);

        return true;
    };

    return (
        <>
            <div className='container'>
                <canvas ref={canvasRef} className='canvas'></canvas>
                <div className="background" style={{ backgroundColor }}></div>
            </div>
        </>
    );
};

export default Connect4Canvas;
