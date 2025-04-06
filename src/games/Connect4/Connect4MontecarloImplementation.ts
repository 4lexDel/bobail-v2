import { Macao } from "macao";
import { Player } from "../../utils/models";
import Connect4Service from "./Connect4Service";
import { Cell } from "./Connect4Game";

export type State = {
  board: Cell[][];
  player: Player;
};

export type Action = { column: number };

export default class Connect4MonteCarlo {
  constructor() {}

  findBestMove(board: Cell[][], player: Player): Promise<Action> {
    const funcs = {
      generateActions: this.generateActions,
      applyAction: this.applyAction,
      stateIsTerminal: this.stateIsTerminal,
      calculateReward: this.calculateReward,
    };

    const config = { duration: 2500 };
    const macao = new Macao<State, Action>(funcs, config);
    return macao.getAction({ board, player });
  }

  generateActions(state: State): Action[] {
    const actions: Action[] = [];
    for (let col = 0; col < 7; col++) {
      if (state.board[col][0] === 0) {
        actions.push({ column: col });
      }
    }
    return actions;
  }

  applyAction(state: State, action: Action): State {
    const newState = { ...state };

    if(action.column < 0 || action.column >= 7) return newState;

    const column = action.column;
    for (let row = 5; row >= 0; row--) {
      if (newState.board[column][row] === 0) {
        newState.board[column][row] = newState.player;
        break;
      }
    }
    newState.player = newState.player === 1 ? 2 : 1;
    return newState;
  }

  stateIsTerminal(state: State): boolean {
    return Connect4Service.checkWin(state.board, 1) || Connect4Service.checkWin(state.board, 2) || Connect4Service.isGridFull(state.board);
  }

  calculateReward(state: State, player: number): number {
    if (Connect4Service.checkWin(state.board, player)) {
      return 1; // Win
    } else if (Connect4Service.checkWin(state.board, player === 1 ? 2 : 1)) {
      return -1; // Loss
    } else if (Connect4Service.isGridFull(state.board)) {
      return 0; // Draw
    }
    return 0; // Not terminal state
  }
}
