import { Macao } from "macao";

import { Cell, Player, Position } from "./BobailGame";
import { ApplyAction, CalculateReward, GenerateActions, StateIsTerminal } from "macao/dist/types/entities";
import BobailService from "./BobailService";

type State = { board: Cell[][], player: Player };
export type Action = { bobailPosition: { from: Position, to: Position }, piecePosition: { from: Position, to: Position } };

type Func = {
    generateActions: GenerateActions<State, Action>;
    applyAction: ApplyAction<State, Action>;
    stateIsTerminal: StateIsTerminal<State>;
    calculateReward: CalculateReward<State>;
};

export default class BobailMontecarloImplementation {
    constructor() {
    }

    findBestMove(gamePosition: Cell[][], currentPlayer: Player): Promise<Action> {       
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
            duration: 5000
            // ...
        };

        const macao = new Macao<State, Action>(funcs, config);
        
        return macao.getAction({ board: gamePosition, player: currentPlayer });
    }

    generateActions(state: State): Action[] {
        const actions: Action[] = [];

        const bobailPosition = BobailService.getBobailPosition(state.board);
        if (!bobailPosition) throw new Error("Bobail is missing from the grid");

        // Generate all possible Bobail moves
        let bobailMoves = BobailService.getAdjacentPositions(bobailPosition)
            .filter(pos => state.board[pos.x][pos.y] === 0);

        for (const bobailMove of bobailMoves) {
            const newGridBobail = state.board.map(row => [...row]);

            newGridBobail[bobailPosition.x][bobailPosition.y] = 0;
            newGridBobail[bobailMove.x][bobailMove.y] = 3;

            // Generate all possible piece moves for current player
            const playerPositions = BobailService.getPlayerPositions(newGridBobail, state.player);
            for (const piece of playerPositions) {
                const pieceMoves = BobailService.getLinearMoves(newGridBobail, piece);
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

        // Move the Bobail => TO REFACTO!!
        if(action.bobailPosition) {
            newBoard[action.bobailPosition.from.x][action.bobailPosition.from.y] = 0;
            newBoard[action.bobailPosition.to.x][action.bobailPosition.to.y] = 3;
        }        

        // Move the player's piece
        newBoard[action.piecePosition.from.x][action.piecePosition.from.y] = 0;
        newBoard[action.piecePosition.to.x][action.piecePosition.to.y] = state.player;

        return { board: newBoard, player: state.player === 1 ? 2 : 1 };
    }

    stateIsTerminal(state: State): boolean {
        return BobailService.isGameOver(state.board);
    }

    calculateReward(state: State, player: number): number {
        const bobailPosition = BobailService.getBobailPosition(state.board);

        if(!bobailPosition) return 0;

        if(bobailPosition.y === 4) return (player === 1 ? -1 : 1);
        else if(bobailPosition.y === 0) return (player === 1 ? 1 : -1);

        const adjacentPositions = BobailService.getAdjacentPositions(bobailPosition)
            .filter((pos) => state.board[pos.x][pos.y] === 0)
        
        if(!adjacentPositions.length) return 1;

        return 0;
    }
}