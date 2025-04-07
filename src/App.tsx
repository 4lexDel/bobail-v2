import { useState } from 'react';
import './app.css'
import Header, { GameTitle, Settings } from './components/Header/Header';
import BobailCanvas from './components/BobailCanvas/BobailCanvas';
import Connect4Canvas from './components/Connect4Canvas/Connect4Canvas';

function App() {
  const [gameSelected, setGameSelected] = useState("bobail");
  const [settings, setSettings] = useState<Settings>({
    reflexionTime: 5000,
    player: 1
  });

  const handleOnGameChange = (value: GameTitle) => {
    console.log(value);
    setGameSelected(value);
  }

  const handleSettingsChange = (value: Settings) => {   
    setSettings(value);
  }

  return (
    <>
    <div className="main">
      <Header onGameChange={handleOnGameChange} onSettingsChange={handleSettingsChange}/>
      {gameSelected === "bobail" && <BobailCanvas settings={settings}/>}
      {gameSelected === "connect-four" && <Connect4Canvas settings={settings}/>}
      {gameSelected === "abalone" && <h1>Abalone coming soon...</h1>}
      {gameSelected === "othello" && <h1>Othello coming soon...</h1>}
    </div>
    </>
  )
}

export default App;
