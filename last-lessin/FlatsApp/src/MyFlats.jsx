import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./MyFlats.css";

function MyFlats() {
  const [flats, setFlats] = useState([]);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const editFlat = (flatId) => {
    navigate(`/edit-flat/${flatId}`);
  };

  const viewFlatDetails = (flatId) => {
    navigate(`/flat-details/${flatId}`);
  };

  const deleteFlat = async (flatId) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userSnapshot = await getDoc(userDocRef);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        const userFlats = userData.flats || [];

        // Filter out the flat to delete
        const updatedFlats = userFlats.filter(flat => flat.id !== flatId);
        await updateDoc(userDocRef, { flats: updatedFlats });

        setFlats(updatedFlats);
      }
    } catch (error) {
      console.error("Error deleting flat:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const userSnapshot = await getDoc(userDocRef);
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const userFlats = userData.flats || []; 
            setFlats(userFlats);
          }
        } catch (error) {
          console.error("Error fetching user flats:", error);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h2>My Flats</h2>
      {flats.length === 0 ? (
        <p>No flats available.</p>
      ) : (
        <div className="flats-container">
          {flats.map((flat) => (
            <div key={flat.id} className="flats-card">
              <button
                className="delete-button"
                onClick={() => deleteFlat(flat.id)}
              >
                &times;
              </button>
              <div className="flat-details">
                <div className="flat-field">
                  <label>City:</label>
                  <p>{flat.city}</p>
                </div>
                <div className="flat-field">
                  <label>Street Name:</label>
                  <p>{flat.streetName}</p>
                </div>
                <div className="flat-field">
                  <label>Street Number:</label>
                  <p>{flat.streetNumber}</p>
                </div>
              </div>
              <div className="actions">
                <button onClick={() => viewFlatDetails(flat.id)} className="details">
                  See details
                </button>
                <button onClick={() => editFlat(flat.id)} className="edit">Edit flat</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyFlats;