import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { useState } from "react";
import { setDoc, doc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import Logo from './Logo.jpg';

function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [fullName, setFullName] = useState(""); 
  const [date, setDate] = useState(""); 
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    const hasLetter = /[A-Za-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);
    return password.length >= 6 && hasLetter && hasNumber && hasSpecialChar;
  };

  const validateAge = (date) => {
    const today = new Date();
    const dob = new Date(date);
    let age = today.getFullYear() - dob.getFullYear();
    const monthDifference = today.getMonth() - dob.getMonth();
    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < dob.getDate())
    ) {
      age--;
    }
    return age >= 18 && age <= 120;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!email || !validateEmail(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password || !validatePassword(password)) {
      newErrors.password =
      "Password must be 6+ characters, with letters, numbers, and a special character.";
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match!";
    }
    if (!fullName || fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters long!";
    }
    if (!firstName || firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters long!";
    }
    if (!lastName || lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters long!";
    }
    if (!date || !validateAge(date)) {
      newErrors.date = "You must be between 18 and 120 years old!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", userCredential.user.uid), {
          fullName,
          firstName,
          lastName,
          email,
          password,
          role: "user",
          flats: [],
          dateOfBirth: date, 
        });
        alert("Registration successful!");
        navigate('/login');
      } catch (error) {
        if (error.code === "auth/email-already-in-use") {
          setErrors({ firebase: "This email is already registered. Please try another one or log in." });
        } else {
          console.error("Error registering user:", error);
          setErrors({ firebase: "Failed to register. Please try again!" });
        }
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>     
      <div className="base-container">
        <div className="header">Create account</div>
        <div className="content">
          <div className="logo">
            <img src={Logo} alt="Logo" />
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
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>
            <div className="form-group">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label>Password</label>
              {errors.password && <p className="error-message">{errors.password}</p>}
            </div>
            <div className="form-group">
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <label>Confirm Password</label>
              {errors.confirmPassword && <p className="error-message">{errors.confirmPassword}</p>}
            </div>
            <div className="form-group">
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
              <label>Full Name</label>
              {errors.fullName && <p className="error-message">{errors.fullName}</p>}
            </div>
            <div className="form-group">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <label>First Name</label>
              {errors.firstName && <p className="error-message">{errors.firstName}</p>}
            </div>
            <div className="form-group">
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
              <label>Last Name</label>
              {errors.lastName && <p className="error-message">{errors.lastName}</p>}
            </div>
            <div className="form-group">
              <h4>Birth Date</h4>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              {errors.date && <p className="error-message">{errors.date}</p>}
            </div>
            {errors.firebase && <p className="error-message">{errors.firebase}</p>}
            <div className="footer">
              <button type="submit" className="btn">Register</button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export default RegisterForm;