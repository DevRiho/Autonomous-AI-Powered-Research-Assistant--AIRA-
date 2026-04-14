import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Verify = () => {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [mousePos, setMousePos] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    
    const { verifyEmail, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
        if (user && user.isVerified) {
            navigate('/');
        }
    }, [email, user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        
        if (code.length !== 6) {
            return setErrorMsg('Verification code must be 6 digits.');
        }

        setLoading(true);
        const res = await verifyEmail(email, code);
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
            className="login-container" 
            onMouseMove={handleMouseMove}
            style={{ 
                '--mouse-x': `${mousePos.x}px`, 
                '--mouse-y': `${mousePos.y}px` 
            }}
        >
            <div className="login-box">
                <h2>Verify Your Email</h2>
                <p>We've sent a 6-digit code to <strong>{email}</strong>.</p>
                {errorMsg && <div className="error-flag">{errorMsg}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group" style={{ textAlign: 'center' }}>
                        <input 
                            type="text" 
                            value={code} 
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))} 
                            placeholder="000000"
                            required 
                            style={{ 
                                fontSize: '24px', 
                                letterSpacing: '8px', 
                                textAlign: 'center', 
                                fontWeight: '700',
                                padding: '16px'
                            }}
                        />
                    </div>
                    
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? 'Verifying...' : 'Complete Verification'}
                    </button>
                </form>
                <div className="register-link">
                    <p>Didn't receive a code? <a href="#" onClick={(e) => { e.preventDefault(); alert("We would resend it here via the backend!"); }}>Resend code</a></p>
                </div>
            </div>

            <style>{`
                .login-container {
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
                    background-color: var(--bg-main);
                    background-image: 
                        radial-gradient(circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(74, 144, 226, 0.25) 0%, transparent 40%),
                        radial-gradient(circle at calc(100% - var(--mouse-x, 50%)) calc(100% - var(--mouse-y, 50%)), rgba(16, 185, 129, 0.15) 0%, transparent 40%);
                    color: var(--text-main);
                    position: relative;
                    overflow: hidden;
                }
                .login-container::before {
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
                .login-box {
                    position: relative;
                    z-index: 10;
                    background-color: var(--glass-bg);
                    backdrop-filter: blur(24px);
                    -webkit-backdrop-filter: blur(24px);
                    padding: 50px 40px;
                    border-radius: 16px;
                    border: 1px solid var(--glass-border);
                    width: 100%;
                    max-width: 420px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }
                @keyframes floatIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .login-box {
                    animation: floatIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .login-box h2 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 28px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    color: var(--text-main);
                }
                .login-box p {
                    color: var(--text-muted);
                    margin-bottom: 30px;
                }
                .input-group {
                    margin-bottom: 24px;
                }
                .input-group input {
                    width: 100%;
                    background-color: var(--bg-main);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    color: var(--text-main);
                    box-sizing: border-box;
                    transition: border-color 0.2s, box-shadow 0.2s;
                }
                .input-group input:focus {
                    outline: none;
                    border-color: #4a90e2;
                    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
                    background-color: var(--bg-main);
                }
                .login-btn {
                    width: 100%;
                    padding: 14px;
                    background-color: #4a90e2;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 700;
                    transition: transform 0.2s, background-color 0.2s;
                }
                .login-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .login-btn:hover:not(:disabled) {
                    background-color: #357abd;
                    transform: translateY(-2px);
                }
                .error-flag {
                    color: #ff3b30;
                    margin-bottom: 20px;
                    font-size: 15px;
                    font-weight: 600;
                    text-align: center;
                }
                .register-link {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: var(--text-muted);
                }
                .register-link a {
                    color: #4a90e2;
                    text-decoration: none;
                }
                .register-link a:hover {
                    text-decoration: underline;
                }
            `}</style>
        </div>
    );
};

export default Verify;
