import { useEffect, useState } from 'react';
import './app.css'
import Header, { GameTitle, Settings } from './components/Header/Header';
import BobailCanvas from './components/BobailCanvas/BobailCanvas';
import Connect4Canvas from './components/Connect4Canvas/Connect4Canvas';
import GameControl from './components/GameControl/GameControl';

function App() {
  const [gameSelected, setGameSelected] = useState("bobail");
  const [settings, setSettings] = useState<Settings>({
    reflexionTime: 5000,
    player: 1
  });
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

  const handleSettingsChange = (value: Settings) => {   
    setSettings(value);
  }

  const handleOnRestartClicked = () => {
    // Little trick used to reset the game components
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
        {gameSelected === "bobail" && <BobailCanvas settings={settings}/>}
        {gameSelected === "connect-four" && <Connect4Canvas settings={settings}/>}
        {gameSelected === "abalone" && <h1>Abalone coming soon...</h1>}
        {gameSelected === "othello" && <h1>Othello coming soon...</h1>}
        </>
      )}
    </div>
    </>
  )
}

export default App;
