import { useEffect, useRef, useState } from 'react';
import './abaloneCanvas.css';
import Swal from 'sweetalert2';
import { CanvasGame } from '../../utils/canvas/CanvasGame';
import { Player } from '../../utils/models';
import AbaloneGame, { Cell } from '../../games/Abalone/AbaloneGame';
import { Action } from '../../games/Abalone/AbaloneMontecarloImplementation';

const createWorker = () => new Worker(
    new URL('../../workers/connect4.worker.js', import.meta.url),
    { type: 'module' }
);

const AbaloneCanvas = ({ reflexionTime, onAiProcessStart, onAiProcessEnd }: { reflexionTime: number, player: Player, onAiProcessStart: () => void, onAiProcessEnd: () => void }) => {
    const canvasRef = useRef(null);
    const [backgroundColor, setBackgroundColor] = useState("tomato");

    let abaloneGame: AbaloneGame;
    let game: CanvasGame;

    let newWorker: Worker | null = null;

    let isAlgorithmProcessing = false;

    const reflexionTimeRef = useRef<number>(reflexionTime);

    useEffect(() => {
        abaloneGame = new AbaloneGame();
        refreshBackgroundColor();
        if (!canvasRef.current) return;
        game = new CanvasGame(canvasRef.current, abaloneGame.getGrid(), "HEXAGON");
        game.onCellClicked = handleCellClick;
        game.onCellHover = handleCellHover;
    }, []);

    const handleCellHover = (x: number, _: number) => {
        // game.editFlagGrid(Array.from({ length: 6 }, (_, i) => ({ x, y: i })), CanvasGame.HOVER);
    }

    const handleCellClick = (x: number, _: number) => {
        // if (isAlgorithmProcessing || abaloneGame.isGameOver()) return;
        // game.resetFlagGrid();

        // processMove(x);
        // if(checkWinner()) return;
    };

    useEffect(() => {
        reflexionTimeRef.current = reflexionTime;
    }, [reflexionTime]);

    const processMove = (column: number) => {
        if (abaloneGame.movePiece(column)) {
            refreshBackgroundColor();
            updateGameGrid(abaloneGame.getGrid());

            game.editFlagGrid(Array.from({length: 6}, (_, i) => ({x: column, y: i})), CanvasGame.LAST_MOVE);

            resetWorker();
            if (newWorker) {
                newWorker.onmessage = (event) => {
                    // AI answer
                    handleWorkerOnMessage(event);
                }               

                isAlgorithmProcessing = true;
                onAiProcessStart();
                newWorker.postMessage({ grid: abaloneGame.getGrid(), player: abaloneGame.getCurrentPlayer(), reflexionTime: reflexionTimeRef.current });
            }
        }
        
        checkWinner();
    };

    const handleWorkerOnMessage = (event: MessageEvent<any>) => {
        const { nextAction }: { nextAction: Action } = event.data;
        onAiProcessEnd();

        setTimeout(() => {
            abaloneGame.movePiece(nextAction.column);
            const grid = abaloneGame.getGrid();

            updateGameGrid(grid);
            game.editFlagGrid(Array.from({length: 6}, (_, i) => ({x: nextAction.column, y: i})), CanvasGame.LAST_MOVE);

            processAiPostMove();
        }, 200);
    }

    const processAiPostMove = () => {
        isAlgorithmProcessing = false;
        
        refreshBackgroundColor();
        abaloneGame.checkGameOver();
        return checkWinner();
    }

    const refreshBackgroundColor = () => {
        setBackgroundColor(abaloneGame.getCurrentPlayer() === 1 ? "tomato" : "lightskyblue");
    }

    const resetWorker = () => {
        if (newWorker) newWorker.terminate();
        newWorker = createWorker();
    }

    const updateGameGrid = (newGrid: Cell[][]) => {
        abaloneGame.setGrid(newGrid);
        game.setGrid(newGrid);
    }

    const checkWinner = () => {
        if (!abaloneGame.isGameOver()) return false; 

        const message = abaloneGame.getWinner() === 0 ? "This game is a draw!" : `Player ${abaloneGame.getWinner()} has won!`;
        let color = abaloneGame.getWinner() === 1 ? "red" : "blue";
        if(abaloneGame.getWinner() === 0) color = "black";

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
                    abaloneGame.initGame();
                    game.setGrid(abaloneGame.getGrid());
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

export default AbaloneCanvas;
