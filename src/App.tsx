import { useRef, useState } from 'react';
import './app.css'
import Header, { GameTitle } from './components/Header/Header';
import BobailCanvas from './components/BobailCanvas/BobailCanvas';
import Connect4Canvas from './components/Connect4Canvas/Connect4Canvas';
import GameControl from './components/GameControl/GameControl';
import { Player } from './utils/models';
import ReversiCanvas from './components/ReversiCanvas/ReversiCanvas';
import AbaloneCanvas from './components/AbaloneCanvas/AbaloneCanvas';

function App() {
  const [gameSelected, setGameSelected] = useState("bobail");
  const [player, setPlayer] = useState<Player>(1);
  const [refresh, setRefresh] = useState(true);
  
  const [aiProgress, setAiProgress] = useState(0);
  const loaderNbStep = 10;
  
  const [reflexionTime, setReflexionTime] = useState<number>(5000);
  const reflexionTimeRef = useRef(5000);

  const handleOnGameChange = (value: GameTitle) => {
    setGameSelected(value);
    // Game title added as url param to be able to share the game
    const url = new URL(window.location.href);
    url.searchParams.set('game', value);
    window.history.pushState({}, '', url);
  }

  const handleSettingsChange = (value: number) => {
    setReflexionTime(value);
    reflexionTimeRef.current = value;
  }

  const handleOnRestartClicked = (playerValue: Player) => {
    // Little trick used to reset the game components
    setPlayer(playerValue);

    setRefresh(false);
    setTimeout(() => {
      setRefresh(true);
    }, 0);
  }

  const handleAiProcessChanged = (start: boolean) => {
    if (start) {
      setAiProgress(0);
      let step = 0;
      const interval = setInterval(() => {
        if (step >= loaderNbStep) {
          clearInterval(interval);
          step = 0;
          setAiProgress(0);
          return;
        }

        step++;
        setAiProgress(step);
      }, reflexionTimeRef.current / loaderNbStep);
    }
    else {
      setAiProgress(0);
    }
  }

  return (
    <>
      <div className="main">
        <Header onGameChange={handleOnGameChange} onSettingsChange={handleSettingsChange} />
        <GameControl onRestartClicked={handleOnRestartClicked} />
        {aiProgress !== 0 && 
          <div className="progressbar-container">
            <progress className='progressbar' max={loaderNbStep} value={aiProgress} />
          </div>
        }
        {refresh && gameSelected === "bobail" && <BobailCanvas reflexionTime={reflexionTime} player={player} onAiProcessStart={() => handleAiProcessChanged(true)} onAiProcessEnd={() => handleAiProcessChanged(false)} />}
        {refresh && gameSelected === "connect-four" && <Connect4Canvas reflexionTime={reflexionTime} player={player} onAiProcessStart={() => handleAiProcessChanged(true)} onAiProcessEnd={() => handleAiProcessChanged(false)} />}
        {refresh && gameSelected === "abalone" && <AbaloneCanvas reflexionTime={reflexionTime} player={player} onAiProcessStart={() => handleAiProcessChanged(true)} onAiProcessEnd={() => handleAiProcessChanged(false)} />}
        {refresh && gameSelected === "othello" && <ReversiCanvas reflexionTime={reflexionTime} player={player} onAiProcessStart={() => handleAiProcessChanged(true)} onAiProcessEnd={() => handleAiProcessChanged(false)} />}
      </div>
    </>
  )
}

export default App;
