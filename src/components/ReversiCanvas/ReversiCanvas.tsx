import { useEffect, useRef, useState } from 'react';
import './reversiCanvas.css';
import Swal from 'sweetalert2';
import { CanvasGame } from '../../utils/canvas/CanvasGame';
import { Player } from '../../utils/models';
import ReversiGame, { Cell } from '../../games/Reversi/ReversiGame';
import { Action } from '../../games/Reversi/ReversiMontecarloImplementation';
import ReversiService from '../../games/Reversi/ReversiService';

const createWorker = () => new Worker(
    new URL('../../workers/reversi.worker.js', import.meta.url),
    { type: 'module' }
);

const ReversiCanvas = ({ reflexionTime, onAiProcessStart, onAiProcessEnd }: { reflexionTime: number, player: Player, onAiProcessStart: () => void, onAiProcessEnd: () => void }) => {
    const canvasRef = useRef(null);
    const [backgroundColor, setBackgroundColor] = useState("tomato");

    const reversiGame = new ReversiGame();
    let game: CanvasGame;

    let newWorker: Worker | null = null;

    let isAlgorithmProcessing = false;

    const reflexionTimeRef = useRef<number>(reflexionTime);

    useEffect(() => {
        if (!canvasRef.current) return;
        game = new CanvasGame(canvasRef.current, reversiGame.getGrid());
        game.onCellClicked = handleCellClick;
        game.onCellHover = handleCellHover;

        highlightAvailableMoves();
    }, []);

    const handleCellHover = (x: number, y: number) => {
        game.editFlagGrid([{ x, y }], CanvasGame.HOVER);
    }

    const handleCellClick = (x: number, y: number) => {
        if (isAlgorithmProcessing || reversiGame.isGameOver()) return;
        game.resetFlagGrid(false);

        processMove(x, y);
    };

    useEffect(() => {
        reflexionTimeRef.current = reflexionTime;
    }, [reflexionTime]);

    const processMove = (x: number, y: number) => {
        const playerBeforeMove = reversiGame.getCurrentPlayer();
        if (reversiGame.movePiece(x, y)) {            
            refreshBackgroundColor();
            updateGameGrid(reversiGame.getGrid());

            game.editFlagGrid([{ x, y }], CanvasGame.LAST_MOVE);

            checkWinner();

            if (playerBeforeMove !== reversiGame.getCurrentPlayer()) callAi();
            else highlightAvailableMoves();
        }
    };

    const callAi = () => {
        resetWorker();
        if (newWorker) {
            highlightAvailableMoves();
            newWorker.onmessage = (event) => {
                // AI answer
                handleWorkerOnMessage(event);
            }               

            isAlgorithmProcessing = true;
            onAiProcessStart();
            newWorker.postMessage({ grid: reversiGame.getGrid(), player: reversiGame.getCurrentPlayer(), reflexionTime: reflexionTimeRef.current });
        }
    }

    const handleWorkerOnMessage = (event: MessageEvent<any>) => {
        const { nextAction }: { nextAction: Action } = event.data;
        
        onAiProcessEnd();

        setTimeout(() => {
            const playerBeforeMove = reversiGame.getCurrentPlayer();
            reversiGame.movePiece(nextAction.x, nextAction.y);
            const grid = reversiGame.getGrid();

            updateGameGrid(grid);

            processAiPostMove();

            game.editFlagGrid([{ x: nextAction.x, y: nextAction.y }], CanvasGame.LAST_MOVE);

            // Keep playing if the player can't play
            if (playerBeforeMove === reversiGame.getCurrentPlayer()) {
                callAi();
            }
        }, 200);
    }

    const processAiPostMove = () => {
        isAlgorithmProcessing = false;
        
        refreshBackgroundColor();
        reversiGame.checkGameOver();

        highlightAvailableMoves();

        return checkWinner();
    }

    const highlightAvailableMoves = () => {
        const availablePositions = ReversiService.getAvailableMoves(reversiGame.getGrid(), reversiGame.getCurrentPlayer());
        if (availablePositions?.length) {
            game.editFlagGrid(availablePositions, CanvasGame.MOVE_AVAILABLE);
        }
    };

    const refreshBackgroundColor = () => {
        setBackgroundColor(reversiGame.getCurrentPlayer() === 1 ? "tomato" : "lightskyblue");
    }

    const resetWorker = () => {
        if (newWorker) newWorker.terminate();
        newWorker = createWorker();
    }

    const updateGameGrid = (newGrid: Cell[][]) => {
        reversiGame.setGrid(newGrid);
        game.setGrid(newGrid);
    }

    const checkWinner = () => {
        if (!reversiGame.isGameOver()) return false; 

        const message = reversiGame.getWinner() === 0 ? "This game is a draw!" : `Player ${reversiGame.getWinner()} has won!`;
        let color = reversiGame.getWinner() === 1 ? "red" : "blue";
        if(reversiGame.getWinner() === 0) color = "black";

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
                    reversiGame.initGame();
                    game.setGrid(reversiGame.getGrid());
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

export default ReversiCanvas;
