import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import Header from './Header';
import './UserProfile.css'; 

function UserProfile() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUser({
            fullName: `${userData.firstName} ${userData.lastName}`,
            email: userData.email,
            role: userData.role,
            age: getUserAge(userData.dateOfBirth),
          });
          setFlats(userData.flats || []);
        } else {
          setError("User not found.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        setError("Failed to fetch user profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) return <p>Loading user profile...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <Header />
      <div className="user-profile-container">
        <h2>User Profile</h2>
      <div className="profile-card">
        <p><strong>Full Name:</strong> {user.fullName}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Age:</strong> {user.age}</p>
      </div>

      <h1>User's Flats</h1>
      <div className="user-container">
        {flats.length > 0 ? (
          flats.map((flat) => (
            <div className="user-card" key={flat.id}>
              <p><strong>City:</strong> {flat.city}</p>
              <p><strong>Street Name:</strong> {flat.streetName}</p>
              <p><strong>Street Number:</strong> {flat.streetNumber}</p>
              <p><strong>Area Size:</strong> {flat.areaSize}</p>
              <p><strong>Has AC:</strong> {flat.hasAC ? "Yes" : "No"}</p>
              <p><strong>Year Built:</strong> {flat.yearBuilt}</p>
              <p><strong>Rent Price:</strong> {flat.rentPrice}</p>
              <p><strong>Date Available:</strong> {new Date(flat.dateAvailable).toLocaleDateString()}</p>
            </div>
          ))
        ) : (
          <p>No flats listed.</p>
        )}
      </div>
      </div>
    </div>
  );
}

function getUserAge(dob) {
  if (!dob) return null;

  let birthDate = dob instanceof Timestamp ? dob.toDate() : new Date(dob);
  if (isNaN(birthDate)) return null;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) age--;
  return age;
}

export default UserProfile;