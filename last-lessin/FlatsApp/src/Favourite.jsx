import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, updateDoc, getDoc } from "firebase/firestore"; 
import Header from './Header'; 
import "./Favourite.css";

function Favourites() {
    const [favorites, setFavorites] = useState([]);
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true); 

    const removeFavorite = async (flatId) => {
        if (!user) return;

        try {
            const userDoc = doc(db, "users", user.uid);
            const docSnap = await getDoc(userDoc);
            if (docSnap.exists()) {
                const userData = docSnap.data();
                const updatedFavorites = userData.favorites.filter(id => id !== flatId);

                await updateDoc(userDoc, { favorites: updatedFavorites });

               
                setFavorites(prevFavorites => prevFavorites.filter(flat => flat.id !== flatId));
            }
        } catch (error) {
            console.error("Error removing favorite:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setLoading(true); 
                try {
                    const userDoc = doc(db, "users", currentUser.uid);
                    const userSnapshot = await getDoc(userDoc);
                    if (userSnapshot.exists()) {
                        const userData = userSnapshot.data();
                        const userFavorites = userData.favorites || [];

                      
                        const usersSnapshot = await getDocs(collection(db, "users"));
                        const allFavorites = [];

                        
                        usersSnapshot.forEach((userDoc) => {
                            const userData = userDoc.data();
                            const userFlats = userData.flats || [];

                            userFlats.forEach(flat => {
                              
                                if (userFavorites.includes(flat.id)) {
                                    allFavorites.push({ 
                                        ...flat, 
                                        ownerId: userDoc.id, 
                                        ownerName: `${userData.firstName} ${userData.lastName}` 
                                    }); 
                                }
                            });
                        });

                        setFavorites(allFavorites);
                    }
                } catch (error) {
                    setError("Error fetching favorites. Please try again.");
                    console.error("Error fetching favorites:", error);
                } finally {
                    setLoading(false); 
                }
            } else {
                
                setFavorites([]);
                setUser(null);
                setLoading(false); 
            }
        });

        return () => unsubscribe();
    }, []);

    if (loading) return <p>Loading favorites...</p>;
    return (
        <div>
            <Header />
            <h2>My Favourites</h2>
            {error && <p>{error}</p>}
            {favorites.length === 0 ? (
                <p>No favorite flats available.</p>
            ) : (
                <div className="favorites-container">
                    {favorites.map((flat) => (
                        <div key={flat.id} className="favorite-card">
                            <h3>{flat.city || "N/A"}</h3>
                                <div className="flat-favorite">
                                <label>Street Name:</label>
                            <p>{flat.streetName || "N/A"}</p>
                            </div>
                                <div className="flat-favorite">
                                <label>Street Number:</label>
                            <p>{flat.streetNumber || "N/A"}</p>
                            </div>
                                <div className="flat-favorite">
                                <label>Owner:</label>
                            <p>{flat.ownerName || "N/A"}</p>
                            </div>
                            <button className="remove-button" onClick={() => removeFavorite(flat.id)}>
                                &times; 
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Favourites;