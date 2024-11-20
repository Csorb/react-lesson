import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import "./Login.css";
import Logo from './Logo.jpg';



function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/homepage');
    } catch(error){
      console.error("Login error:", error);
      setErrors('Invalid email or password');
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };
  return (
      <form onSubmit={handleSubmit}>
         <div className="base-container">
        <div className="header">Login</div>
        <div className="content">
          <div className="logo">
            <img src={Logo} />
          </div>
          <div className="form">
        <div className="form-group">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        <label>Email</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        <label>Password</label>
        </div>
        {errors && <p className="error-message">{errors}</p>}
        <div className="footer">
        <button type="submit" className="login-btn">Login</button>
        <button onClick={goToRegister} className="btn">Register</button>
        </div>
        </div>
    </div>
    </div>
      </form>
  
  );
}

export default LoginForm;
