import { Macao } from "macao";

import { Cell } from "./BobailGame";
import { ApplyAction, CalculateReward, GenerateActions, StateIsTerminal } from "macao/dist/types/entities";
import BobailService from "./BobailService";
import { Player, Position } from "../../utils/models";

export type State = { board: Cell[][], player: Player };
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

    findBestMove(gamePosition: Cell[][], currentPlayer: Player, reflexionTime: number): Promise<Action> {
        const funcs: Func = {
            generateActions: this.generateActions,
            applyAction: this.applyAction,
            stateIsTerminal: this.stateIsTerminal,
            calculateReward: this.calculateReward
        };

        const config = { duration: reflexionTime };

        const macao = new Macao<State, Action>(funcs, config);
        
        return macao.getAction({ board: gamePosition.map(row => [...row]), player: currentPlayer });
    }

    generateActions(state: State): Action[] {
        return BobailService.generateActions(state);
    }

    applyAction(state: State, action: Action): State {
        return BobailService.applyAction(state, action);
    }

    stateIsTerminal(state: State): boolean {
        return BobailService.isGameOver(state.board);
    }

    calculateReward(state: State, player: number): number {
        let currentState = state;
    
        while (!BobailService.isGameOver(state.board)) {
            const availableActions = BobailService.generateActions(currentState);
       
            const selectedAction = availableActions[Math.random()*(availableActions.length-1)]; // Without heuristic
    
            currentState = BobailService.applyAction(currentState, selectedAction);
        }

        const bobailPosition = BobailService.getBobailPosition(currentState.board);

        if(!bobailPosition) return 0;

        if(bobailPosition.y === 4) return (player === 1 ? -1 : 1);
        else if(bobailPosition.y === 0) return (player === 1 ? 1 : -1);

        const adjacentPositions = BobailService.getAdjacentPositions(bobailPosition)
            .filter((pos) => currentState.board[pos.x][pos.y] === 0)
        
        if(!adjacentPositions.length) return 1;

        return 0;
    }
}