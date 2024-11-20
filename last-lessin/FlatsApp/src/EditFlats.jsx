import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from 'firebase/auth';
import Header from './Header'; 
import "./Register.css";

function FlatEditor() {
  const { flatId } = useParams();
  const navigate = useNavigate();
  const [flat, setFlat] = useState({
    city: "",
    streetName: "",
    streetNumber: "",
    areaSize: "",
    hasAC: false,
    yearBuilt: "",
    rentPrice: "",
    dateAvailable: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const fetchFlatData = async () => {
        if (user) {
          const flatsCollection = doc(db, "users", user.uid);
          const flatDoc = await getDoc(flatsCollection);
          if (flatDoc.exists()) {
            const finalFlatData = flatDoc.data();
            const flatArr = finalFlatData.flats || [];
            const currentFlat = flatArr.find(f => String(f.id) === flatId); 
            if (currentFlat) {
              setFlat(currentFlat);
            } else {
              setError("Flat not found.");
            }
            setLoading(false);
          } else {
            setError("User has no flats.");
            setLoading(false);
          }
        }
      };
      fetchFlatData();
    });

    return () => unsubscribe();
  }, [flatId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFlat((prevFlat) => ({
      ...prevFlat,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const flatDocRef = doc(db, "users", auth.currentUser.uid); 

    try {
      const flatDoc = await getDoc(flatDocRef);
      if (flatDoc.exists()) {
        const finalFlatData = flatDoc.data();
        const flatArr = finalFlatData.flats || [];
        const updatedFlats = flatArr.map(f => String(f.id) === flatId ? flat : f); 

        await updateDoc(flatDocRef, {
          flats: updatedFlats
        });
        navigate("/homepage");
      }
    } catch (error) {
      console.error("Error updating flat:", error);
      setError("Failed to update flat.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <Header/>
      <div className="base-container">
      <div className="header">Edit Flat</div>
      <form onSubmit={handleSubmit}>
      <div className="content">
       <div className="form">
        <div className="form-group">
          <input
            type="text"
            name="city"
            value={flat.city}
            onChange={handleChange}
            required
          />
           <label>City</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            name="streetName"
            value={flat.streetName}
            onChange={handleChange}
            required
          />
            <label>Street Name</label>
        </div>
        <div className="form-group">
          <input
            type="number"
            name="streetNumber"
            value={flat.streetNumber}
            min="1"
            onChange={handleChange}
            required
          />
            <label>Street Number</label>
        </div>
        <div className="form-group">
          <input
            type="number"
            name="areaSize"
            value={flat.areaSize}
            onChange={handleChange}
            min="1"
            required
          />
           <label>Area Size</label>
        </div>
        <div className="checkbox">
          <h4>Has AC</h4>
          <input
            className="click" 
            type="checkbox"
            name="hasAC"
            checked={flat.hasAC}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <input
            type="number"
            name="yearBuilt"
            value={flat.yearBuilt}
            onChange={handleChange}
            min="1"
            required
          />
          <label>Year Built</label>
        </div>
        <div className="form-group">
          <input
            type="number"
            name="rentPrice"
            value={flat.rentPrice}
            onChange={handleChange}
            min="1"
            required
          />
          <label>Rent Price</label>
        </div>
        <div className="form-group">
          <h4>Date Available</h4>
          <input
            type="date"
            name="dateAvailable"
            value={flat.dateAvailable}
            onChange={handleChange}
            min="1"
            required
          />
        </div>
        <button type="submit" className="btn">Update Flat</button>
        </div>
        </div>
      </form>
    </div>
    </div>
  );
}

export default FlatEditor;