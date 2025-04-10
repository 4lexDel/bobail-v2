// Worker

import { Cell } from "../games/Reversi/ReversiGame";
import ReversiMonteCarlo from "../games/Reversi/ReversiMontecarloImplementation";
import { Player } from "../utils/models";

onmessage = async(event) => {
  const { grid, player, reflexionTime }: { grid: Cell[][], player: Player, reflexionTime: number } = event.data;
  
  const reversiAlgorithm = new ReversiMonteCarlo();

  const nextAction = await reversiAlgorithm.findBestMove(grid, player, reflexionTime);

  postMessage({ nextAction });
};