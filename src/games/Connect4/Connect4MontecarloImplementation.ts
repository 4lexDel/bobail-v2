import { Macao } from "macao";
import { Player } from "../../utils/models";
import Connect4Service from "./Connect4Service";

type Cell = 0 | Player;

export type State = {
  board: Cell[][];
  player: Player;
};

type Action = { column: number };

export default class Connect4MonteCarlo {
  constructor() {}

  findBestMove(board: Cell[][], player: Player): Promise<Action> {
    const funcs = {
      generateActions: this.generateActions,
      applyAction: this.applyAction,
      stateIsTerminal: this.stateIsTerminal,
      calculateReward: this.calculateReward,
    };

    const config = { duration: 5000 };
    const macao = new Macao<State, Action>(funcs, config);
    return macao.getAction({ board, player });
  }

  generateActions(state: State): Action[] {
    return state.board[0].map((_, col) => (state.board[0][col] === 0 ? { column: col } : null)).filter(Boolean) as Action[];
  }

  applyAction(state: State, action: Action): State {
    const newBoard = state.board.map((row) => [...row]);
    for (let row = Connect4Service.ROWS - 1; row >= 0; row--) {
      if (newBoard[row][action.column] === 0) {
        newBoard[row][action.column] = state.player;
        break;
      }
    }
    return { board: newBoard, player: (state.player * -1) as Player };
  }

  stateIsTerminal(state: State): boolean {
    return Connect4Service.getWinner(state) !== 0 || this.generateActions(state).length === 0;
  }

  calculateReward(state: State, player: number): number {
    const winner = Connect4Service.getWinner(state);
    return winner === player ? 1 : winner === -player ? -1 : 0;
  }
}
