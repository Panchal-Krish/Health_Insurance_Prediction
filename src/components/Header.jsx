    // import "./../styles/Header.css";

// function Header() {
//     return (
//         <header className="header">
//             <div className="nav-logo">
//                 <img src="/PRO.svg" alt="Logo" className="logo-image" />
//             </div>

//             <nav className="nav">
//                 <a className="active">Home</a>
//                 <a>Diseases</a>
//                 <a>AI Analysis</a>
//                 <a>How it Works</a>
//                 <a>About Us</a>
//                 <a>Contact</a>
//             </nav>

//             <div className="actions">
//                 <button className="theme-btn">🌙</button>
//                 <button className="signin-btn">Sign In</button>
//             </div>
//         </header>
//     );
// }

// export default Header;
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import "./../styles/Header.css";
import logo from "../assets/logo.png";

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    const isLoggedIn = localStorage.getItem("isLoggedIn");

    const handleMouseEnter = (e) => {
        if (!e.target.classList.contains('active')) {
            e.target.style.color = "#387ed1";
        }
    };

    const handleMouseLeave = (e) => {
        if (!e.target.classList.contains('active')) {
            e.target.style.color = "#6b7280";
        }
    };

    const handleSignIn = () => {
        navigate('/signin');
    };

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    const handleLogout = () => {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("userEmail");
        navigate('/signin');
    };

    return (
        <header className="header">
            <div className="nav-logo">
                <div className="logo-icon">
                    <img src={logo} alt="Logo" className="logo-image" />
                </div>
                <div className="logo-text">
                    <span className="logo-title">Yam Hai Hum</span>
                    <span className="tagline">Predict your insurance today</span>
                </div>
            </div>

            <nav className="nav">
                <Link to="/" className={location.pathname === '/' ? 'active' : ''} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Home</Link>
                <Link to="/ai-analysis" className={location.pathname === '/ai-analysis' ? 'active' : ''} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>AI Analysis</Link>
                <Link to="/how-it-works" className={location.pathname === '/how-it-works' ? 'active' : ''} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>How it Works</Link>
                <Link to="/about" className={location.pathname === '/about' ? 'active' : ''} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>About Us</Link>
                <Link to="/contact" className={location.pathname === '/contact' ? 'active' : ''} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Contact</Link>
            </nav>

            <div className="actions">
                {isLoggedIn ? (
                    <>
                        <button className="signin-btn" onClick={handleDashboard}>
                            Dashboard
                        </button>
                        <button className="signin-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <button className="signin-btn" onClick={handleSignIn}>
                        <span className="user-icon"></span>
                        Sign In
                    </button>
                )}
            </div>
        </header>
    );
}

export default Header;
