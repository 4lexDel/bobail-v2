import Swal from 'sweetalert2';
import './gameControl.css';
import { useState } from 'react';
import { Player } from '../../utils/models';

const GameControl = ({ onRestartClicked }: { onRestartClicked: (playerValue: Player) => void }) => {
    const [selectedPlayer, setSelectedPlayer] = useState<string>('1');

    let radioInputs!: HTMLInputElement[];

    const handleRestartClick = () => {
        Swal.fire({
            title: "Restart the game?",
            showDenyButton: true,
            confirmButtonText: "Yes",
            denyButtonText: `No`,
            html: `
                <input type="radio" name="player" id="player1" value="1" ${selectedPlayer === "1" ? 'checked' : ''} disabled="true">
                <label for="player1"> Player 1</label>
                <input type="radio" name="player" id="player2" value="2" ${selectedPlayer === "2" ? 'checked' : ''} disabled="true">
                <label for="player2"> Player 2</label>
                </div>`,
            didOpen: () => {
                radioInputs = Array.from(Swal.getPopup()!.querySelectorAll('select[name="player"]')) as HTMLInputElement[];
            }
        }).then((result) => {
            if (result.isConfirmed) {
                let playerValue!: string;
                radioInputs.forEach((radio) => {
                    if ((radio as HTMLInputElement)?.checked) {
                        playerValue = (radio as HTMLInputElement).value;
                    }
                });
                setSelectedPlayer(playerValue);
                onRestartClicked(parseInt(playerValue) as Player);
            }
        });
    }

    return (
        <div className='game-control' onClick={handleRestartClick}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" stroke="black" strokeWidth="20" fill="whitesmoke" style={{ width: "25px", height: "25px" }}>
                <path d="M125.7 160l50.3 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L48 224c-17.7 0-32-14.3-32-32L16 64c0-17.7 14.3-32 32-32s32 14.3 32 32l0 51.2L97.6 97.6c87.5-87.5 229.3-87.5 316.8 0s87.5 229.3 0 316.8s-229.3 87.5-316.8 0c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0c62.5 62.5 163.8 62.5 226.3 0s62.5-163.8 0-226.3s-163.8-62.5-226.3 0L125.7 160z" />
            </svg>
        </div>
    );
};

export default GameControl;
