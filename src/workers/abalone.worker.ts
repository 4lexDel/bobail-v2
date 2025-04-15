// Worker

import { Cell } from "../games/Abalone/AbaloneGame";
import AbaloneMonteCarlo from "../games/Abalone/AbaloneMontecarloImplementation";
import { Player } from "../utils/models";

onmessage = async(event) => {
  const { grid, player, reflexionTime }: { grid: Cell[][], player: Player, reflexionTime: number } = event.data;
  
  const abaloneAlgorithm = new AbaloneMonteCarlo();

  const nextAction = await abaloneAlgorithm.findBestMove(grid, player, reflexionTime);

  postMessage({ nextAction });
};