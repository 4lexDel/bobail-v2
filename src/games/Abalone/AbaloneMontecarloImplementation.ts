import { Macao } from "macao";
import { Player } from "../../utils/models";
import AbaloneService from "./AbaloneService";
import { Cell } from "./AbaloneGame";

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
    return AbaloneService.generateActions(state);
  }

  applyAction(state: State, action: Action): State {
    return AbaloneService.applyAction(state, action);
  }

  stateIsTerminal(state: State): boolean {
    return AbaloneService.isGameOver(state.board);
  }

  calculateReward(state: State, player: number): number {
    let currentState = state;

    while (!AbaloneService.isGameOver(state.board)) {
      const availableActions = AbaloneService.generateActions(currentState);

      const selectedAction = availableActions[Math.random() * (availableActions.length - 1)]; // Without heuristic

      currentState = AbaloneService.applyAction(currentState, selectedAction);
    }

    if (AbaloneService.checkWin(state.board, player)) return -1; // Win
    if (AbaloneService.checkWin(state.board, player === 1 ? 2 : 1)) return 1; // Loss
    if (AbaloneService.isGridFull(state.board)) return 0; // Draw

    return 0; // Not terminal state
  }
}
