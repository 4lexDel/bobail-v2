import { Macao } from "macao";
import { Player } from "../../utils/models";
import { Cell } from "./ReversiGame";
import ReversiService from "./ReversiService";

export type State = {
  board: Cell[][];
  player: Player;
};

export type Action = { x: number, y: number };

export default class ReversiMonteCarlo {
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
    return macao.getAction({ board: gamePosition, player });
  }

  generateActions(state: State): Action[] {
    return ReversiService.getAvailableMoves(state.board, state.player);
    // const actions = ReversiService.getAvailableMoves(state.board, state.player);

    // return actions
    //   .map(action => {
    //     const nextBoard = ReversiService.applyMove(state.board, state.player, action);
    //     const score = ReversiService.evaluatePosition(nextBoard, state.player); // Use the heuristic we wrote
    //     return { action, score };
    //   })
    //   .sort((a, b) => b.score - a.score) // Descending order: best score first
    //   .map(entry => entry.action);       // Extract actions only
  }

  applyAction(state: State, action: Action): State {
    if (!action) return { board: state.board.map(col => [...col]), player: state.player };

    const newBoard = ReversiService.applyMove(state.board, state.player, action) as Cell[][];

    const opponent = state.player === 1 ? 2 : 1;
    let newPlayer = opponent;

    // If the opponent can't play
    if (!ReversiService.getAvailableMoves(newBoard, opponent).length) newPlayer = state.player;

    return { board: newBoard, player: newPlayer as Player };
  }

  stateIsTerminal(state: State): boolean {
    return ReversiService.isGameOver(state.board);
  }

  calculateReward(state: State, player: number): number {
    const winner = ReversiService.getCurrentWinner(state.board);
    if (winner === player) return -1;
    if (winner !== player) return 1;
    return 0;
    if (winner === 0) return 0;

    // // Heuristic to evaluate the intermediaire position
    // const score = ReversiService.evaluatePosition(state.board, player);

    // return score/200;
  }
}
