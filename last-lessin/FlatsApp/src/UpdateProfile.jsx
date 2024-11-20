
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import Header from './Header'; 
import "./Register.css";

function ProfileUpdate() {
  const [userData, setUserData] = useState({
    fullName: "",
    firstName: "",
    lastName: "",
    email: "", 
    dateOfBirth: "", 
    currentPassword: "",
    confirmPassword: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData({
            ...data,
            dateOfBirth: data.dateOfBirth
              ? (data.dateOfBirth.toMillis
                  ? new Date(data.dateOfBirth.toMillis())
                  : new Date(data.dateOfBirth)
                )
                  .toISOString()
                  .split("T")[0]
              : "",
            currentPassword: "",
            password: "",
            confirmPassword: "",
          });
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({ ...prevData, [name]: value }));
  };

  const validateAge = (date) => {
    const birthDate = new Date(date);
    const ageDiffMs = Date.now() - birthDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18 && age <= 120;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!userData.fullName || userData.fullName.length < 2) {
      newErrors.fullName = "Full name must be at least 2 characters long!";
    }
    if (!userData.firstName || userData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters long!";
    }
    if (!userData.lastName || userData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters long!";
    }
    if (!userData.dateOfBirth || !validateAge(userData.dateOfBirth)) {
      newErrors.dateOfBirth = "You must be between 18 and 120 years old!";
    }
    if (userData.password && userData.password !== userData.confirmPassword) {
      newErrors.password = "Passwords do not match!";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const user = auth.currentUser;

        
        if (userData.currentPassword) {
          const credential = EmailAuthProvider.credential(user.email, userData.currentPassword);
          await reauthenticateWithCredential(user, credential);
        }

   
        if (userData.password) {
          await updatePassword(user, userData.password);
        }


        const userDocRef = doc(db, "users", user.uid);
        await updateDoc(userDocRef, {
          fullName: userData.fullName,
          firstName: userData.firstName,
          lastName: userData.lastName,
          dateOfBirth: userData.dateOfBirth ? new Date(userData.dateOfBirth) : null,
          password: userData.password
        });

        alert("Profile updated successfully!");
        navigate("/homepage");
      } catch (error) {
        console.error("Error updating profile:", error);
        setErrors({ firebase: "Failed to update profile. Please try again!" });
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <Header/>
      <div className="base-container">
      <div className="header">Update Profile</div>
      <div className="content">
      <form onSubmit={handleSubmit}>
        <div className="form">
        <div className="form-group">
          <input
            type="text"
            name="fullName"
            value={userData.fullName}
            onChange={handleChange}
            required
          />
           <label>Full Name</label>
          {errors.fullName && <p lassName="error-message">{errors.fullName}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="firstName"
            value={userData.firstName}
            onChange={handleChange}
            required
          />
           <label>First Name</label>
          {errors.firstName && <p className="error-message">{errors.firstName}</p>}
        </div>
        <div className="form-group">
          <input
            type="text"
            name="lastName"
            value={userData.lastName}
            onChange={handleChange}
            required
          />
           <label>Last Name</label>
          {errors.lastName && <p className="error-message">{errors.lastName}</p>}
        </div>
        <div className="form-group input-box">
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            readOnly 
          />
           <label>Email</label>
        </div>
        <div className="form-group">
          <h4>Birth Date</h4>
          <input
            type="date"
            name="dateOfBirth"
            value={userData.dateOfBirth}
            onChange={handleChange}
            required
          />
          {errors.dateOfBirth && <p className="error-message">{errors.dateOfBirth}</p>}
        </div>
        <div className="form-group">
          <input
            type="password"
            name="currentPassword"
            value={userData.currentPassword}
            onChange={handleChange}
            required
          />
           <label>Current Password</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            name="password"
            value={userData.password}
            onChange={handleChange}
            required
          />
            <label>New Password</label>
        </div>
        <div className="form-group">
          <input
            type="password"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
            required
          />
           <label>Confirm New Password</label>
          {errors.password && <p className="error-message">{errors.password}</p>}
        </div>
        <button type="submit"  className="btn">Update Profile</button>
        </div>
      </form>
      {errors.firebase && <p sclassName="error-message">{errors.firebase}</p>}
      </div>
      </div>
    </div>
  );
}

export default ProfileUpdate;