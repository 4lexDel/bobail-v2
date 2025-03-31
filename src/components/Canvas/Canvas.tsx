import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import './canvas.css'
import { Game } from '../../Utils/Game/Game';
import BobailGame from '../../Utils/Bobail/BobailGame';

const Canvas = forwardRef(({ }, ref) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvaRef = useRef(null);

    let game: any = null;
    // let newWorker = null;
    const bobailGame = new BobailGame();

    useEffect(() => {
        let timeoutId: number;

        gameLogic();

        const observerCallback = (entries: any) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                window.requestAnimationFrame(() => {
                    if (containerRef.current) {
                        game.resize(containerRef.current.clientWidth, containerRef.current.clientHeight);
                    }
                });
            }, 100); // Debounce time
        };

        const resizeObserver = new ResizeObserver(observerCallback);

        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
            clearTimeout(timeoutId);
        };
    }, [containerRef]);

    const gameLogic = () => {
        if (canvaRef.current) {
            const grid = bobailGame.getBoard();
            game = new Game(canvaRef.current, grid);

            game.onCellClicked = (x: number, y: number) => {
                const grid = bobailGame.getBoard();
                const origin = {x, y};

                if (grid[x][y] === bobailGame.getCurrentPlayer() && bobailGame.getBobailMoved()) {
                    const availablePositions = bobailGame.getAvailablePieceMoves({x, y});

                    if (availablePositions && availablePositions.length) {
                        game.drawFlagGrid({ origin, flagPositions: availablePositions, value: 1 });
                    }
                }
                else if (grid[x][y] === 3 && !bobailGame.getBobailMoved()) {
                    const availablePositions = bobailGame.getAvailableBobailMoves({x, y});

                    if (availablePositions && availablePositions.length) {
                        game.drawFlagGrid({ origin, flagPositions: availablePositions, value: 1 });
                    }
                }
                else {
                    game.resetFlagGrid();
                }
            }
        }
    }

    // useImperativeHandle(ref, () => ({
    //     changePattern, solve, resetWorker
    // }), [game]);

    return (
        <div ref={containerRef} className='canvas-container'>
            <canvas ref={canvaRef} className='canvas'></canvas>
        </div>
    )
});

export default Canvas;

