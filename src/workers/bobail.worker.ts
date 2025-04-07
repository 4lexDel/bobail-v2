// Worker

import { Cell } from "../games/Bobail/BobailGame";
import BobailMontecarloImplementation from "../games/Bobail/BobailMontecarloImplementation";
import { Player } from "../utils/models";

onmessage = async(event) => {
  const { grid, player, reflexionTime }: { grid: Cell[][], player: Player, reflexionTime: number } = event.data;
  
  const bobailAlgorithm = new BobailMontecarloImplementation();

  const nextAction = await bobailAlgorithm.findBestMove(grid, player, reflexionTime);

  postMessage({ nextAction });
};