import { useEffect, useRef, useState } from 'react';
import './bobailCanvas.css';
import Swal from 'sweetalert2';
import { CanvasGame } from '../../utils/canvas/CanvasGame';
import BobailGame, { Cell } from '../../games/Bobail/BobailGame';
import { Position } from '../../utils/models';
import { Action } from '../../games/Bobail/BobailMontecarloImplementation';

const createWorker = () => new Worker(
    new URL('../../workers/bobail.worker.js', import.meta.url),
    { type: 'module' }
);

const BobailCanvas = () => {
    const canvasRef = useRef(null);
    const [backgroundColor, setBackgroundColor] = useState("tomato");

    const bobailGame = new BobailGame();
    let game: CanvasGame;

    let newWorker: Worker | null = null;

    let firstMove: Position | null = null;

    let isAlgorithmProcessing = false;

    useEffect(() => {
        if (!canvasRef.current) return;
        game = new CanvasGame(canvasRef.current, bobailGame.getGrid());
        game.onCellClicked = handleCellClick;
    }, []);

    const handleCellClick = (x: number, y: number) => {
        if (bobailGame.isGameOver() || isAlgorithmProcessing) return;
        const grid = bobailGame.getGrid();
        game.resetFlagGrid();
        const cellSelected: Position = { x, y };

        if (grid[x][y] === bobailGame.getCurrentPlayer() && bobailGame.getBobailMoved()) {
            highlightAvailableMoves(bobailGame.getAvailablePieceMoves(cellSelected), cellSelected);
        } else if (grid[x][y] === 3 && !bobailGame.getBobailMoved()) {
            highlightAvailableMoves(bobailGame.getAvailableBobailMoves(cellSelected), cellSelected);
        } else if (grid[x][y] === 0 && firstMove) {
            processMove(cellSelected);
        }
    };

    const highlightAvailableMoves = (availablePositions: Position[], cellSelected: Position) => {
        if (availablePositions?.length) {
            firstMove = cellSelected;
            game.drawFlagGrid({ origin: cellSelected, flagPositions: availablePositions });
        }
    };

    const processMove = (cellSelected: Position) => {
        if (bobailGame.getBobailMoved() && firstMove) {
            if (bobailGame.movePiece(firstMove, cellSelected)) {
                setBackgroundColor(bobailGame.getCurrentPlayer() === 1 ? "tomato" : "lightskyblue");
                updateGameGrid(bobailGame.getGrid());

                resetWorker();
                if (newWorker) {
                    newWorker.onmessage = (event) => {
                        // AI answer
                        handleWorkerOnMessage(event);
                    }
                    
                    isAlgorithmProcessing = true;
                    newWorker.postMessage({ grid: bobailGame.getGrid(), player: bobailGame.getCurrentPlayer() });
                }
            }
        } else {
            bobailGame.moveBobail(cellSelected);
        }
        firstMove = null;
        checkWinner();
    };

    const handleWorkerOnMessage = (event: MessageEvent<any>) => {
        const { nextAction }: { nextAction: Action } = event.data;

        if (nextAction) {
            const grid = bobailGame.getGrid();

            grid[nextAction.bobailPosition.from.x][nextAction.bobailPosition.from.y] = 0;
            grid[nextAction.bobailPosition.to.x][nextAction.bobailPosition.to.y] = 3;
            updateGameGrid(grid);

            const isGameOver = processAiPostMove(false);
            if(isGameOver) return;

            setTimeout(() => {
                grid[nextAction.piecePosition.from.x][nextAction.piecePosition.from.y] = 0;
                grid[nextAction.piecePosition.to.x][nextAction.piecePosition.to.y] = bobailGame.getCurrentPlayer();
                updateGameGrid(grid);

                processAiPostMove(true);
            }, 700);
        }
    }

    const processAiPostMove = (switchPlayer: boolean = false) => {
        if (switchPlayer) {
            bobailGame.switchPlayer();
            setBackgroundColor(bobailGame.getCurrentPlayer() === 1 ? "tomato" : "lightskyblue");
            isAlgorithmProcessing = false;
        }
        
        bobailGame.checkGameOver();
        return checkWinner();
    }

    const resetWorker = () => {
        if (newWorker) newWorker.terminate();
        newWorker = createWorker();
    }

    const updateGameGrid = (newGrid: Cell[][]) => {
        bobailGame.setGrid(newGrid);
        game.setGrid(newGrid);
    }

    const checkWinner = () => {
        const winner = bobailGame.getWinner();
        if (!winner) return false;

        setTimeout(() => {
            Swal.fire({
                title: "Game over",
                html: `<span style="font-weight: bold; color: ${winner === 1 ? "red" : "blue"}">Player ${winner}</span> has won!`,
                icon: "success",
                allowEscapeKey: false,
                allowOutsideClick: false,
                showDenyButton: true,
                confirmButtonText: "Restart",
                denyButtonText: "Close",
            }).then(({ isConfirmed }) => {
                if (isConfirmed) {
                    bobailGame.initGame();
                    game.setGrid(bobailGame.getGrid());
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

export default BobailCanvas;
