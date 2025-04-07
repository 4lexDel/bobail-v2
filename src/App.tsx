import { useEffect, useState } from 'react';
import './app.css'
import Header, { GameTitle } from './components/Header/Header';
import BobailCanvas from './components/BobailCanvas/BobailCanvas';
import Connect4Canvas from './components/Connect4Canvas/Connect4Canvas';
import GameControl from './components/GameControl/GameControl';
import { Player } from './utils/models';

function App() {
  const [gameSelected, setGameSelected] = useState("bobail");
  const [player, setPlayer] = useState<Player>(1);
  const [reflexionTime, setReflexionTime] = useState<number>(5000);
  const [refresh, setRefresh] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const gameParam = urlParams.get('game') as GameTitle;
    if (gameParam) {
      setGameSelected(gameParam);
    }
  }, []);

  const handleOnGameChange = (value: GameTitle) => {
    console.log(value);
    setGameSelected(value);
    // Game title added as url param to be able to share the game
    const url = new URL(window.location.href);
    url.searchParams.set('game', value);
    window.history.pushState({}, '', url);
  }

  const handleSettingsChange = (value: number) => {   
    setReflexionTime(value);
  }

  const handleOnRestartClicked = (playerValue: Player) => {
    // Little trick used to reset the game components
    setPlayer(playerValue);
    
    setRefresh(false);
    setTimeout(() => {
      setRefresh(true);
    }
    , 0);
  }

  return (
    <>
    <div className="main">
      <Header onGameChange={handleOnGameChange} onSettingsChange={handleSettingsChange}/>
      <GameControl onRestartClicked={handleOnRestartClicked}/>
      {refresh && (
        <>
        {gameSelected === "bobail" && <BobailCanvas reflexionTime={reflexionTime} player={player}/>}
        {gameSelected === "connect-four" && <Connect4Canvas reflexionTime={reflexionTime} player={player}/>}
        {gameSelected === "abalone" && <h1>Abalone coming soon...</h1>}
        {gameSelected === "othello" && <h1>Othello coming soon...</h1>}
        </>
      )}
    </div>
    </>
  )
}

export default App;
