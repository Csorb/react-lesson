import { useState, useEffect } from "react";
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Header from './Header'; 
import "./Register.css";

function AddFlats() {
    const [flatData, setFlatData] = useState({
        id: Date.now(),
        city: '',
        streetName: '',
        streetNumber: '',
        areaSize: '',
        hasAC: false,
        yearBuilt: '',
        rentPrice: '',
        dateAvailable: ''
    });
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            }
        });
        return unsubscribe;
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFlatData((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!flatData.city || !flatData.streetName || !flatData.streetNumber || 
            !flatData.areaSize || !flatData.yearBuilt || !flatData.rentPrice || 
            !flatData.dateAvailable) {
            alert("Please fill in all required fields.");
            return;
        }
    
        if (!user) {
            alert("Please log in to add a flat.");
            return;
        }

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                const userData = userDoc.data();
                const userFlats = userData.flats || [];
                const newFlatData = { ...flatData, id: Date.now() }; // Ensure the new flat has a unique id
                
                // Add the new flat to the user's flats
                const updatedFlats = [...userFlats, newFlatData];
                await updateDoc(userDocRef, { flats: updatedFlats });

                // Navigate back to homepage
                navigate('/homepage');
            } else {
                console.error("User document does not exist.");
            }
        } catch (error) {
            console.error("Error adding flat:", error);
            alert("Failed to add flat. Please try again later.");
        }
    };

    return (
        <div>
            <Header />
            <div className="base-container">
                <div className="header">Add New Flat</div>
                <form onSubmit={handleSubmit}>
                    <div className="content">
                        <div className="form">
                            <div className="form-group">
                                <input type="text" name="city" value={flatData.city} onChange={handleChange} required />
                                <label>City</label>
                            </div>
                            <div className="form-group">
                                <input type="text" name="streetName" value={flatData.streetName} onChange={handleChange} required />
                                <label>Street Name</label>
                            </div>
                            <div className="form-group">
                                <input type="number" name="streetNumber" value={flatData.streetNumber} onChange={handleChange} min="1" required />
                                <label>Street Number</label>
                            </div>
                            <div className="form-group">
                                <input type="number" name="areaSize" value={flatData.areaSize} onChange={handleChange} min="1" required />
                                <label>Area Size</label>
                            </div>
                            <div className="checkbox">
                                    <h4>Has AC</h4>
                                    <input className="click"  type="checkbox" name="hasAC" checked={flatData.hasAC} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <input type="number" name="yearBuilt" value={flatData.yearBuilt} onChange={handleChange} min="1" required />
                                <label>Year Built</label>
                            </div>
                            <div className="form-group">
                                <input type="number" name="rentPrice" value={flatData.rentPrice} onChange={handleChange} min="1" required />
                                <label>Rent Price</label>
                            </div>
                            <div className="form-group">
                                <h4>Date Available</h4>
                                <input type="date" name="dateAvailable" value={flatData.dateAvailable} onChange={handleChange} required />
                            </div>
                            <button type="submit" className="btn">Add Flat</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddFlats;