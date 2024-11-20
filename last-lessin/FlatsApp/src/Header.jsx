import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { signOut, deleteUser, onAuthStateChanged } from "firebase/auth";
import Logo from './Logo.jpg';
import './Header.css'; 

function Header() {
  const [userData, setUserData] = useState(null);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const [isNavActive, setIsNavActive] = useState(false); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const fetchUserData = async () => {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const finalUserData = userDoc.data();
            setUserData(finalUserData);
            setRole(finalUserData.role || "");
          }
        } else {
          setUserData(null);
          setRole("");
        }
        setIsLoading(false);
      };

      fetchUserData();
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.log("Error logging out", error);
    }
  };
  const handleDelete = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const uid = user.uid;
  
        
        await deleteDoc(doc(db, "users", uid));
  
        await deleteUser(user);
  
        navigate("/register");
      }
    } catch (error) {
      console.log("Error deleting user", error);
    }
  };


  const toggleNav = () => {
    setIsNavActive(!isNavActive); 
  };

  return (
    <>
      <header>
        <div className="nav-container">
          <div className="logo"><img src={Logo} alt="Logo" /></div>
          <div className="name">
            {isLoading
              ? "Loading..."
              : `Hello, ${userData ? `${userData.firstName} ${userData.lastName}` : "Guest"}`}
          </div>
          <div className="hamburger-menu" onClick={toggleNav}>
            &#9776; 
          </div>
        </div>
      </header>

      <nav className={`nav ${isNavActive ? 'active' : ''}`}>
        <button onClick={() => navigate("/homepage")}>Home</button>
        <button onClick={() => navigate("/update-profile/:userId")}>My Profile</button>
        <button onClick={() => navigate("/favourite")}>Favourites</button>
        <button onClick={() => navigate("/all-flats/")}>All Flats</button>
        {role === "admin" && (
          <button onClick={() => navigate("/all-users/")}>All Users</button>
        )}
        <button onClick={() => navigate("/add-flats")}>Add Flats</button>
        <button onClick={handleLogout}>Logout</button>
        <button onClick={handleDelete}>Delete Account</button>
      </nav>
    </>
  );
}

export default Header;