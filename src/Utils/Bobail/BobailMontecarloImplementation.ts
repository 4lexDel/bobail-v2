import { Macao } from "macao";

import { Cell, Player, Position } from "./BobailGame";
import { ApplyAction, CalculateReward, GenerateActions, StateIsTerminal } from "macao/dist/types/entities";

type State = { board: Cell[][], player: Player };
type Action = { bobailPosition: { from: Position, to: Position }, piecePosition: { from: Position, to: Position } };

type Func = {
    generateActions: GenerateActions<State, Action>;
    applyAction: ApplyAction<State, Action>;
    stateIsTerminal: StateIsTerminal<State>;
    calculateReward: CalculateReward<State>;
};

export default class BobailMontecarloImplementation {
    constructor() {
    }

    async findBestMove(gamePosition: Cell[][], currentPlayer: Player): Promise<Cell[][]> {       
        // const startTime = performance.now();

        // const endTime = performance.now();
        // console.log(`Execution time: ${endTime - startTime} ms`);
        const funcs: Func = {
            generateActions: this.generateActions,
            applyAction: this.applyAction,
            stateIsTerminal: this.stateIsTerminal,
            calculateReward: this.calculateReward
        };

        const config = {
            duration: 3000
            // ...
        };

        const macao = new Macao<State, Action>(funcs, config);

        // Somewhere inside your game loop
        const action = await macao.getAction({ board: gamePosition, player: currentPlayer });
        const nextState = this.applyAction({ board: gamePosition, player: currentPlayer }, action).board;
        console.log(nextState);
        
        return nextState;
    }

    generateActions(state: State): Action[] {
        const getBobailPosition = (grid: Cell[][]) => {
            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 5; y++) {
                    if (grid[x][y] === 3) {
                        return { x, y };
                    }
                }
            }
            return null;
        }

        const isWithinBounds = (position: Position): boolean => {
            return position.x >= 0 && position.x < 5 && position.y >= 0 && position.y < 5;
        }

        const getAdjacentPositions = (position: Position): Position[] => {
            const directions = [
                { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
            ];
            return directions
                .map(dir => ({ x: position.x + dir.x, y: position.y + dir.y }))
                .filter(isWithinBounds.bind(this));
        }

        const getPlayerPositions = (grid: Cell[][], player: Player): Position[] => {
            const positions: Position[] = [];
            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 5; y++) {
                    if (grid[x][y] === player) {
                        positions.push({ x, y });
                    }
                }
            }
            return positions;
        }

        const getLinearMoves = (grid: Cell[][], position: Position): Position[] => {
            const moves: Position[] = [];
            const directions = [
                { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
            ];
            for (const dir of directions) {
                let x = position.x + dir.x;
                let y = position.y + dir.y;
    
                let pathSearched = false;
                while (isWithinBounds({ x, y }) && grid[x][y] === 0) {
                    x += dir.x;
                    y += dir.y;
                    pathSearched = true;
                }
                pathSearched && moves.push({ x: x - dir.x, y: y - dir.y });
            }
            return moves;
        }

        const actions: Action[] = [];

        // const opponent = currentPlayer === 1 ? 2 : 1;
        const bobailPosition = getBobailPosition(state.board);
        if (!bobailPosition) throw new Error("Bobail is missing from the grid");

        // Generate all possible Bobail moves
        let bobailMoves = getAdjacentPositions(bobailPosition)
            .filter(pos => state.board[pos.x][pos.y] === 0);

        // Remove the backward movement if the bobail can move forward
        // const newBobailMove = bobailMoves.filter((pos) => {
        //     if (currentPlayer === 1) return pos.y > bobailPosition.y;
        //     return pos.y < bobailPosition.y;
        // })

        // if (newBobailMove.length >= 2) bobailMoves = newBobailMove;

        for (const bobailMove of bobailMoves) {
            const newGridBobail = state.board.map(row => [...row]);

            newGridBobail[bobailPosition.x][bobailPosition.y] = 0;
            newGridBobail[bobailMove.x][bobailMove.y] = 3;

            // Generate all possible piece moves for current player
            const playerPositions = getPlayerPositions(newGridBobail, state.player);
            for (const piece of playerPositions) {
                const pieceMoves = getLinearMoves(newGridBobail, piece);
                for (const move of pieceMoves) {
                    actions.push({
                        bobailPosition: { from: { x: bobailPosition.x, y: bobailPosition.y }, to: { x: bobailMove.x, y: bobailMove.y } },
                        piecePosition: { from: { x: piece.x, y: piece.y }, to: { x: move.x, y: move.y } }
                    });
                }
            }
        }

        return actions;
    }

    applyAction(state: State, action: Action): State {
        const newBoard = state.board.map(row => [...row]);

        // Move the Bobail        
        newBoard[action.bobailPosition.from.x][action.bobailPosition.from.y] = 0;
        newBoard[action.bobailPosition.to.x][action.bobailPosition.to.y] = 3;

        // Move the player's piece
        newBoard[action.piecePosition.from.x][action.piecePosition.from.y] = 0;
        newBoard[action.piecePosition.to.x][action.piecePosition.to.y] = state.player;

        return { board: newBoard, player: state.player === 1 ? 2 : 1 };
    }

    stateIsTerminal(state: State): boolean {
        const getBobailPosition = (grid: Cell[][]) => {
            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 5; y++) {
                    if (grid[x][y] === 3) {
                        return { x, y };
                    }
                }
            }
            return null;
        }

        const isWithinBounds = (position: Position): boolean => {
            return position.x >= 0 && position.x < 5 && position.y >= 0 && position.y < 5;
        }

        const getAdjacentPositions = (position: Position): Position[] => {
            const directions = [
                { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
            ];
            return directions
                .map(dir => ({ x: position.x + dir.x, y: position.y + dir.y }))
                .filter(isWithinBounds.bind(this));
        }

        const isGameOver = (grid: Cell[][]): boolean => {
            const bobailPosition = getBobailPosition(grid);
            if(!bobailPosition) throw new Error("Bobail required on the grid");
    
            // Edge winning condition
            if(bobailPosition.y === 4 || bobailPosition.y === 0) return true
    
            const adjacentPositions = getAdjacentPositions(bobailPosition).filter((pos) => grid[pos.x][pos.y] === 0);
            // Stuck winning condition
            if(!adjacentPositions.length) return true;
    
            return false;
        }

        return isGameOver(state.board);
    }

    calculateReward(state: State, player: number): number {
        const getBobailPosition = (grid: Cell[][]) => {
            for (let x = 0; x < 5; x++) {
                for (let y = 0; y < 5; y++) {
                    if (grid[x][y] === 3) {
                        return { x, y };
                    }
                }
            }
            return null;
        }

        const isWithinBounds = (position: Position): boolean => {
            return position.x >= 0 && position.x < 5 && position.y >= 0 && position.y < 5;
        }

        const getAdjacentPositions = (position: Position): Position[] => {
            const directions = [
                { x: -1, y: -1 }, { x: -1, y: 0 }, { x: -1, y: 1 },
                { x: 0, y: -1 }, { x: 0, y: 1 },
                { x: 1, y: -1 }, { x: 1, y: 0 }, { x: 1, y: 1 },
            ];
            return directions
                .map(dir => ({ x: position.x + dir.x, y: position.y + dir.y }))
                .filter(isWithinBounds.bind(this));
        }

        const bobailPosition = getBobailPosition(state.board);

        if(!bobailPosition) return 0;

        if(bobailPosition.y === 4) return (player === 1 ? -1 : 1);
        else if(bobailPosition.y === 0) return (player === 1 ? 1 : -1);

        const adjacentPositions = getAdjacentPositions(bobailPosition)
            .filter((pos) => state.board[pos.x][pos.y] === 0)
        
        if(!adjacentPositions.length) return 1;

        return 0;
    }
}