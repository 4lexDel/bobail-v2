import { useState } from 'react';
import './app.css'
import Header from './components/Header/Header';
import BobailCanvas from './components/BobailCanvas/BobailCanvas';
import Connect4Canvas from './components/Connect4Canvas/Connect4Canvas';

function App() {
  const [gameSelected, setGameSelected] = useState("bobail");

  const handleOnGameChange = (value: string) => {
    console.log(value);
    setGameSelected(value);
  }

  return (
    <>
    <div className="main">
      <Header onGameChange={handleOnGameChange}/>
      {gameSelected === "bobail" && <BobailCanvas/>}
      {gameSelected === "connect-four" && <Connect4Canvas/>}
      {gameSelected === "abalone" && <h1>Abalone coming soon...</h1>}
      {gameSelected === "othello" && <h1>Othello coming soon...</h1>}
    </div>
    </>
  )
}

export default App;
