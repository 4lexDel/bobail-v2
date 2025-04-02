import './header.css'

function Header() {
  return (
    <div className="header">
        <div className="left-side">
            <img src="/bobail-v2/icon.png" alt="icon" />
            <span className='current-game'>Bobail</span>
        </div>
        <div className="links">
            <a href="">Settings</a>
            {/* <span className='slash'>/</span>
            <a href="https://boardgamearena.com/doc/Gamehelpbobail" target='_blank'>Rules</a>
            <span className='slash'>/</span>
            <a href="https://github.com/4lexDel/bobail-v2" target='_blank'>Source code</a> */}
        </div>
    </div>
  )
}

export default Header;
