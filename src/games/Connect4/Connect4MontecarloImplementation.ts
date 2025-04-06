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

  findBestMove(gamePosition: Cell[][], player: Player): Promise<Action> {
    const funcs = {
      generateActions: this.generateActions,
      applyAction: this.applyAction,
      stateIsTerminal: this.stateIsTerminal,
      calculateReward: this.calculateReward,
    };

    const config = { duration: 5000 };
    const macao = new Macao<State, Action>(funcs, config);
    return macao.getAction({ board: gamePosition.map((col) => [...col]), player });
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
    const newBoard = state.board.map(col => [...col]);

    if(action.column < 0 || action.column >= 7) return state;

    const column = action.column;
    for (let row = 5; row >= 0; row--) {
      if (newBoard[column][row] === 0) {
        newBoard[column][row] = state.player;
        break;
      }
    }
    return { board: newBoard, player: state.player === 1 ? 2 : 1 };
  }

  stateIsTerminal(state: State): boolean {
    return (Connect4Service.isGridFull(state.board) || Connect4Service.checkWin(state.board, 1) || Connect4Service.checkWin(state.board, 2));
  }

  calculateReward(state: State, player: number): number {    
    if (Connect4Service.checkWin(state.board, player)) return -1; // Win
    if (Connect4Service.checkWin(state.board, player === 1 ? 2 : 1)) return 1; // Loss
    if (Connect4Service.isGridFull(state.board)) return 0; // Draw
    
    return 0; // Not terminal state
  }
}
