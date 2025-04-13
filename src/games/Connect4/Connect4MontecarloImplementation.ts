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
  constructor() { }

  findBestMove(gamePosition: Cell[][], player: Player, reflexionTime: number): Promise<Action> {
    const funcs = {
      generateActions: this.generateActions,
      applyAction: this.applyAction,
      stateIsTerminal: this.stateIsTerminal,
      calculateReward: this.calculateReward,
    };

    const config = { duration: reflexionTime };
    const macao = new Macao<State, Action>(funcs, config);
    return macao.getAction({ board: gamePosition.map((col) => [...col]), player });
  }

  generateActions(state: State): Action[] {
    return Connect4Service.generateActions(state);
  }

  applyAction(state: State, action: Action): State {
    return Connect4Service.applyAction(state, action);
  }

  stateIsTerminal(state: State): boolean {
    return Connect4Service.isGameOver(state.board);
  }

  calculateReward(state: State, player: number): number {
    let currentState = state;

    while (!Connect4Service.isGameOver(state.board)) {
      const availableActions = Connect4Service.generateActions(currentState);

      const selectedAction = availableActions[Math.random() * (availableActions.length - 1)]; // Without heuristic

      currentState = Connect4Service.applyAction(currentState, selectedAction);
    }

    if (Connect4Service.checkWin(state.board, player)) return -1; // Win
    if (Connect4Service.checkWin(state.board, player === 1 ? 2 : 1)) return 1; // Loss
    if (Connect4Service.isGridFull(state.board)) return 0; // Draw

    return 0; // Not terminal state
  }
}
