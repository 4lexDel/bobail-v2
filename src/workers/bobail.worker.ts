// Worker

import BobailAlgorithmImplementation from "../utils/Bobail/BobailAiImplementation";
import { Cell, Player } from "../utils/Bobail/BobailGame";

onmessage = (event) => {
  const { grid, player }: { grid: Cell[][], player: Player } = event.data;

  const bobailAlgorithm = new BobailAlgorithmImplementation();

  const nextState = bobailAlgorithm.findBestMove(grid, player);

  postMessage({ nextState });
};