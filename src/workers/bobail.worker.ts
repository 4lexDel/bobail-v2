// Worker

import { Cell, Player } from "../utils/Bobail/BobailGame";
import BobailMontecarloImplementation from "../utils/Bobail/BobailMontecarloImplementation";

onmessage = async(event) => {
  const { grid, player }: { grid: Cell[][], player: Player } = event.data;
  
  const bobailAlgorithm = new BobailMontecarloImplementation();

  const nextAction = await bobailAlgorithm.findBestMove(grid, player);

  postMessage({ nextAction });
};