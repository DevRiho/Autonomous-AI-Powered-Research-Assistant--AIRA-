import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        const res = await login(email, password);
        if (!res.success) {
            setErrorMsg(res.error);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Welcome to AIRA</h2>
                <p>Log in to access your research dashboard.</p>
                {errorMsg && <div className="error-flag">{errorMsg}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required 
                        />
                    </div>
                    <button type="submit" className="login-btn">Log In</button>
                </form>
                <div className="register-link">
                    <p>Don't have an account? <Link to="/register">Create one</Link></p>
                </div>
            </div>
            <style>{`
                .login-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background-color: #0a0a0a;
                    color: #ffffff;
                }
                .login-box {
                    background-color: #121212;
                    padding: 40px;
                    border-radius: 8px;
                    border: 1px solid #333;
                    width: 100%;
                    max-width: 400px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.3);
                }
                .login-box h2 {
                    margin-top: 0;
                    margin-bottom: 10px;
                    font-size: 24px;
                }
                .login-box p {
                    color: #b3b3b3;
                    margin-bottom: 25px;
                }
                .input-group {
                    margin-bottom: 20px;
                }
                .input-group label {
                    display: block;
                    margin-bottom: 8px;
                    font-size: 14px;
                }
                .input-group input {
                    width: 100%;
                    padding: 10px;
                    background-color: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 4px;
                    color: white;
                    box-sizing: border-box;
                }
                .input-group input:focus {
                    outline: none;
                    border-color: #4a90e2;
                }
                .login-btn {
                    width: 100%;
                    padding: 12px;
                    background-color: #4a90e2;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    font-weight: 600;
                    margin-top: 10px;
                }
                .login-btn:hover {
                    background-color: #357abd;
                }
                .error-flag {
                    background-color: rgba(255, 59, 48, 0.1);
                    color: #ff3b30;
                    padding: 10px;
                    border-radius: 4px;
                    margin-bottom: 20px;
                    font-size: 14px;
                    border: 1px solid rgba(255, 59, 48, 0.3);
                }
                .register-link {
                    margin-top: 20px;
                    text-align: center;
                    font-size: 14px;
                    color: #b3b3b3;
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

export default Login;
