// Worker

import { Cell } from "../games/Connect4/Connect4Game";
import Connect4MonteCarlo from "../games/Connect4/Connect4MontecarloImplementation";
import { Player } from "../utils/models";

onmessage = async(event) => {
  const { grid, player, reflexionTime }: { grid: Cell[][], player: Player, reflexionTime: number } = event.data;
  
  const connect4Algorithm = new Connect4MonteCarlo();

  const nextAction = await connect4Algorithm.findBestMove(grid, player, reflexionTime);

  postMessage({ nextAction });
};