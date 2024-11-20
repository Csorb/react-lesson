import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { FaHeart } from "react-icons/fa";  
import Header from './Header'; 
import './AllFlats.css';  

function AllFlats() {
    const [flats, setFlats] = useState([]);
    const [userFavorites, setUserFavorites] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cityFilter, setCityFilter] = useState("");
    const [priceRange, setPriceRange] = useState({ min: "", max: "" });
    const [areaSizeRange, setAreaSizeRange] = useState({ min: "", max: "" });
    const [sortCategory, setSortCategory] = useState("city");
    const [refreshCount, setRefreshCount] = useState(0); 
    const navigate = useNavigate();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    const currentUserId = currentUser ? currentUser.uid : null;

    useEffect(() => {
        const fetchFlats = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, "users"));
                const allFlats = [];
                
                for (const userDoc of usersSnapshot.docs) {
                    const userData = userDoc.data();
                    const userFlats = userData.flats || [];
                    const ownerName = `${userData.firstName} ${userData.lastName}`;
                    const ownerEmail = userData.email;

                   
                    userFlats.forEach((flat) => {
                        allFlats.push({
                            id: flat.id,
                            ...flat,
                            ownerName,
                            ownerEmail,
                            ownerId: userDoc.id,
                        });
                    });
                }

                setFlats(allFlats);
            } catch (error) {
                setError("Error fetching flats. Please try again later.");
                console.error("Error fetching flats:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFlats();
    }, [currentUserId, refreshCount]); 

    const fetchUserFavorites = async () => {
        if (!currentUserId) return;

        try {
            const userDoc = doc(db, "users", currentUserId);
            const userSnapshot = await getDoc(userDoc);
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                setUserFavorites(userData.favorites || []);
            }
        } catch (error) {
            setError("Error fetching user favorites.");
            console.error("Error fetching user favorites:", error);
        }
    };

    useEffect(() => {
        fetchUserFavorites();
    }, [currentUserId]);

    const toggleFavorite = async (flatId) => {
        if (!currentUserId) {
            alert("You must be logged in to mark favorites.");
            return;
        }

        const isCurrentlyFavorite = userFavorites.includes(flatId);
        const updatedFavorites = isCurrentlyFavorite
            ? userFavorites.filter(id => id !== flatId)
            : [...userFavorites, flatId];

        setUserFavorites(updatedFavorites);

        try {
            const userDoc = doc(db, "users", currentUserId);
            await updateDoc(userDoc, { favorites: updatedFavorites });
            setRefreshCount(prev => prev + 1); 
        } catch (error) {
            setError("Error updating favorite status.");
            console.error("Error updating favorite status:", error);
        }
    };

    const filteredFlats = flats
        .filter(flat => 
            (!cityFilter || flat.city.toLowerCase().includes(cityFilter.toLowerCase())) &&
            (!priceRange.min || flat.rentPrice >= Number(priceRange.min)) &&
            (!priceRange.max || flat.rentPrice <= Number(priceRange.max)) &&
            (!areaSizeRange.min || flat.areaSize >= Number(areaSizeRange.min)) &&
            (!areaSizeRange.max || flat.areaSize <= Number(areaSizeRange.max))
        )
        .sort((a, b) => {
            if (sortCategory === "city") {
                return a.city.localeCompare(b.city);
            } else if (sortCategory === "price") {
                return a.rentPrice - b.rentPrice;
            } else if (sortCategory === "areaSize") {
                return a.areaSize - b.areaSize;
            }
            return 0;
        });

    return (
        <>
            {isLoading ? (
                <div>Loading...</div>
            ) : error ? (
                <div>{error}</div>
            ) : (
                <div>
                    <Header />
                    <h2>All Flats</h2>
                    <div className="filters">
                        <div className="droppdown">
                            <button className="filter">Filter</button>
                            <div className="content">
                                <input
                                    type="text"
                                    placeholder="Filter by City"
                                    value={cityFilter}
                                    onChange={(e) => setCityFilter(e.target.value)}
                                />
                                <input
                                    type="number"
                                    placeholder="Min Rent Price"
                                    value={priceRange.min}
                                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max Rent Price"
                                    value={priceRange.max}
                                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Min Area Size"
                                    value={areaSizeRange.min}
                                    onChange={(e) => setAreaSizeRange({ ...areaSizeRange, min: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max Area Size"
                                    value={areaSizeRange.max}
                                    onChange={(e) => setAreaSizeRange({ ...areaSizeRange, max: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="droppdown">
                            <select onChange={(e) => setSortCategory(e.target.value)}>
                                <option value="city">Sort by City</option>
                                <option value="price">Sort by Price</option>
                                <option value="areaSize">Sort by Area Size</option>
                            </select>
                        </div>
                    </div>
                    <div className="flat-container">
                        {filteredFlats.map((flat) => (
                            <div key={`${flat.id}-${flat.ownerId}`} className="flat-card">
                                <h3>{flat.city || "N/A"}</h3>
                                <div className="flat-favorite">
                                    <label>Area Size:</label>
                                    <p>{flat.areaSize || "N/A"}</p>
                                </div>
                                <div className="flat-favorite">
                                    <label>Rent Price:</label>
                                    <p>{flat.rentPrice || "N/A"}</p>
                                </div>
                                <div className="flat-favorite">
                                    <label>Owner:</label>
                                    <p>{flat.ownerName || "N/A"}</p>
                                </div>
                                <div className="flat-favorite">
                                    <label>Email:</label>
                                    <p>{flat.ownerEmail || "N/A"}</p>
                                </div>
                                <button className="favorite-button" onClick={() => toggleFavorite(flat.id)}>
                                    <FaHeart color={userFavorites.includes(flat.id) ? "red" : "grey"} />
                                </button>
                                <button className="btn-details" onClick={() => navigate(`/flat-view/${flat.id}`)}>
                                    View Details
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}

export default AllFlats