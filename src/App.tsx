import { useState } from 'react';
import './app.css'
import Canvas from './components/Canvas/Canvas'
import Header from './components/Header/Header';

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
      {gameSelected === "bobail" && <Canvas/>}
      {gameSelected === "connect-four" && <h1>Connect 4 coming soon...</h1>}
      {gameSelected === "abalone" && <h1>Abalone coming soon...</h1>}
      {gameSelected === "othello" && <h1>Othello coming soon...</h1>}
    </div>
    </>
  )
}

export default App;
