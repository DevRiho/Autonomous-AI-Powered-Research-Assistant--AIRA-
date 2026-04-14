import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [fullName, setFullName] = useState('');
    const [interests, setInterests] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    useEffect(() => {
        if (!user) {
            navigate('/login');
        } else if (user.onboarded) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        const res = await updateProfile(fullName, interests);
        setLoading(false);

        if (res.success) {
            navigate('/');
        } else {
            setErrorMsg(res.error);
        }
    };

    const handleMouseMove = (e) => {
        setMousePos({ x: e.clientX, y: e.clientY });
    };

    return (
        <div 
            className="onboarding-container"
            onMouseMove={handleMouseMove}
            style={{ 
                '--mouse-x': `${mousePos.x}px`, 
                '--mouse-y': `${mousePos.y}px` 
            }}
        >
            <div className="onboarding-box glass-card fade-in">
                <h2>Welcome to AIRA</h2>
                <p>Let's personalize your research experience.</p>
                {errorMsg && <div className="error-flag">{errorMsg}</div>}
                
                <form onSubmit={handleSubmit} className="onboarding-form">
                    <div className="input-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Marie Curie"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Primary Research Interests</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Material Science, Nanotechnology"
                            value={interests}
                            onChange={(e) => setInterests(e.target.value)}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="continue-btn theme-button w-full transition-transform hover:-translate-y-1 mt-4"
                    >
                        {loading ? 'Saving...' : 'Enter Dashboard →'}
                    </button>
                </form>
            </div>

            <style>{`
                .onboarding-container {
                    /* Forcible Dark Mode Overrides */
                    --bg-main: #000000;
                    --bg-surface: #0a0a0a;
                    --bg-surface-hover: #111111;
                    --text-main: #f4f4f5;
                    --text-muted: #a1a1aa;
                    --border-color: #27272a;
                    --glass-bg: rgba(10, 10, 10, 0.65);

                    display: flex;
                    justify-content: center;
                    align-items: center;
                    min-height: 100vh;
                    width: 100%;
                    background-color: var(--bg-main);
                    background-image: 
                        radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(74, 144, 226, 0.25) 0%, transparent 40%),
                        radial-gradient(circle at calc(100% - var(--mouse-x, 50%)) calc(100% - var(--mouse-y, 50%)), rgba(99, 102, 241, 0.15) 0%, transparent 40%);
                    color: var(--text-main);
                    position: relative;
                    overflow: hidden;
                    font-family: inherit;
                }
                .onboarding-container::before {
                    content: '';
                    position: absolute;
                    width: 200%;
                    height: 200%;
                    top: -50%;
                    left: -50%;
                    z-index: 0;
                    background-image: 
                        linear-gradient(var(--border-color) 1px, transparent 1px),
                        linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
                    background-size: 60px 60px;
                    opacity: 0.8;
                    transform: perspective(1000px) rotateX(60deg) translateY(-100px) translateX(calc(var(--mouse-x) * -0.02));
                    pointer-events: none;
                    transition: transform 0.1s ease-out;
                }
                .onboarding-box {
                    position: relative;
                    z-index: 10;
                    background-color: var(--glass-bg);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 50px 40px;
                    border-radius: 16px;
                    border: 1px solid var(--glass-border);
                    width: 100%;
                    max-width: 480px;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }
                .onboarding-box h2 {
                    font-size: 28px;
                    margin-bottom: 10px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    color: var(--text-main);
                }
                .onboarding-box p {
                    color: var(--text-muted);
                    margin-bottom: 30px;
                    font-size: 15px;
                }
                .input-group {
                    margin-bottom: 24px;
                    text-align: left;
                    width: 100%;
                    box-sizing: border-box;
                }
                .input-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .input-group input {
                    width: 100%;
                    padding: 12px 16px;
                    background-color: var(--bg-main);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--text-main);
                    box-sizing: border-box;
                    transition: border-color 0.2s, box-shadow 0.2s;
                    font-size: 15px;
                }
                .input-group input:focus {
                    outline: none;
                    border-color: #4a90e2;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
                    background-color: var(--bg-main);
                }
                .continue-btn {
                    padding: 14px;
                    font-size: 16px;
                    font-weight: 700;
                    border-radius: 8px;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border: none;
                    background-color: #4a90e2;
                    color: white;
                }
                .continue-btn:hover {
                    background-color: #357abd;
                }
                .error-flag {
                    color: #ff3b30;
                    margin-bottom: 24px;
                    font-size: 15px;
                    font-weight: 600;
                    text-align: center;
                }
                .fade-in {
                    animation: fadeIn 0.6s ease-out forwards;
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default Onboarding;
