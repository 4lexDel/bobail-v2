// Worker

import { Cell } from "../games/Connect4/Connect4Game";
import Connect4MonteCarlo from "../games/Connect4/Connect4MontecarloImplementation";
import { Player } from "../utils/models";

onmessage = async(event) => {
  const { grid, player }: { grid: Cell[][], player: Player } = event.data;
  
  const Connect4Algorithm = new Connect4MonteCarlo();

  const nextAction = await Connect4Algorithm.findBestMove(grid, player);

  postMessage({ nextAction });
};