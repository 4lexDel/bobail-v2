import { useEffect, useRef, useState } from 'react';
import './canvas.css';
import { Game } from '../../utils/Game/Game';
import BobailGame, { Cell, Position } from '../../utils/Bobail/BobailGame';
import Swal from 'sweetalert2';
import BobailAlgorithmImplementation from '../../utils/Bobail/BobailAiImplementation';

const createWorker = () => new Worker(
    new URL('../../workers/bobail.worker.js', import.meta.url),
    { type: 'module' }
);

const Canvas = () => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef(null);
    const [backgroundColor, setBackgroundColor] = useState("tomato");

    const bobailGame = new BobailGame();
    let game: Game;

    let newWorker: Worker | null = null;

    const bobailAlgorithm = new BobailAlgorithmImplementation();

    let firstMove: Position | null = null;
    let timeoutId: number;

    useEffect(() => {
        initializeGame();
        const cleanup = setupResizeObserver();
        return cleanup;
    }, []);

    const initializeGame = () => {
        if (!canvasRef.current) return;
        game = new Game(canvasRef.current, bobailGame.getGrid());
        game.onCellClicked = handleCellClick;
    };

    const setupResizeObserver = () => {
        if (!containerRef.current) return;
        const resizeObserver = new ResizeObserver(() => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                if (containerRef.current) {
                    game.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
                }
            }, 100);
        });
        resizeObserver.observe(containerRef.current);
        return () => resizeObserver.disconnect();
    };

    const handleCellClick = (x: number, y: number) => {
        if (bobailGame.isGameOver()) return;
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
                        const { nextState } = event.data;

                        if (nextState) {
                            updateGameGrid(nextState);
                            bobailGame.switchPlayer();

                            setBackgroundColor(bobailGame.getCurrentPlayer() === 1 ? "tomato" : "lightskyblue");
                        }
                    }

                    newWorker.postMessage({ grid: bobailGame.getGrid(), player: bobailGame.getCurrentPlayer() });
                }
            }
        } else {
            bobailGame.moveBobail(cellSelected);
        }
        firstMove = null;
        checkWinner();
    };

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
        if (!winner) return;

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
    };

    return (
        <div ref={containerRef} className='canvas-container' style={{ backgroundColor }}>
            <canvas ref={canvasRef} className='canvas'></canvas>
        </div>
    );
};

export default Canvas;
