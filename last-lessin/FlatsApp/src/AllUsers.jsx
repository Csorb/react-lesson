import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase"; 
import { collection, query, getDocs } from "firebase/firestore";
import { Timestamp } from "firebase/firestore"; 
import Header from './Header'; 
import "./AllUsers.css";

function AllUsers() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({
    userType: "",
    ageRange: { min: 18, max: 120 },
    flatsCounterRange: { min: 0, max: 100 },
  });
  const [sortField, setSortField] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const q = query(collection(db, "users")); 
        const querySnapshot = await getDocs(q);
        const usersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersData);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  const applyFilters = (user) => {
    const userAge = getUserAge(user.dateOfBirth);
    const inAgeRange =
      userAge >= filters.ageRange.min && userAge <= filters.ageRange.max;
    const inFlatsRange =
      user.flats.length >= filters.flatsCounterRange.min &&
      user.flats.length <= filters.flatsCounterRange.max;
    const userTypeFilter =
      filters.userType === "" || user.role === filters.userType;

    return inAgeRange && inFlatsRange && userTypeFilter;
  };

  const applySorting = (a, b) => {
    if (sortField === "firstName") {
      return a.firstName.localeCompare(b.firstName);
    }
    if (sortField === "lastName") {
      return a.lastName.localeCompare(b.lastName);
    }
    if (sortField === "flatsCounter") {
      return b.flats.length - a.flats.length;
    }
    return 0;
  };

  const filteredAndSortedUsers = users
    .filter(applyFilters)
    .sort(applySorting);

  return (
    <>
      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <div className="all-users-container">
          <Header />
          <h2>All Users</h2>
          <div className="filters-container">
            <div className="filter-group">
              <label>User Type</label>
              <select
                className="filter-select"
                value={filters.userType}
                onChange={(e) =>
                  setFilters({ ...filters, userType: e.target.value })
                }
              >
                <option value="">All</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Age Range</label>
              <input
                type="number"
                placeholder="Min Age"
                value={filters.ageRange.min}
                onChange={(e) =>
                  setFilters({ ...filters, ageRange: { ...filters.ageRange, min: e.target.value } })
                }
              />
              <input
                type="number"
                placeholder="Max Age"
                value={filters.ageRange.max}
                onChange={(e) =>
                  setFilters({ ...filters, ageRange: { ...filters.ageRange, max: e.target.value } })
                }
              />
            </div>

            <div className="filter-group">
              <label>Flats Counter Range</label>
              <input
                type="number"
                placeholder="Min Flats"
                value={filters.flatsCounterRange.min}
                onChange={(e) =>
                  setFilters({ ...filters, flatsCounterRange: { ...filters.flatsCounterRange, min: e.target.value } })
                }
              />
              <input
                type="number"
                placeholder="Max Flats"
                value={filters.flatsCounterRange.max}
                onChange={(e) =>
                  setFilters({ ...filters, flatsCounterRange: { ...filters.flatsCounterRange, max: e.target.value } })
                }
              />
            </div>

            <div className="filter-group">
              <label>Sort By</label>
              <select className="filter-select" value={sortField} onChange={(e) => setSortField(e.target.value)}>
                <option value="">None</option>
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="flatsCounter">Flats Counter</option>
              </select>
            </div>
          </div>

          <div className="users-card-container">
            {filteredAndSortedUsers.map((user) => (
              <div className="users-card" key={user.id}>
                 <h3>{user.firstName} {user.lastName}</h3>
                  <div className="users-detail">
                    <label>Age:</label>
                    <p>{getUserAge(user.dateOfBirth)}</p>
                  </div>
                  <div className="users-detail">
                    <label>Flats:</label>
                    <p>{user.flats.length}</p>
                  </div>
                  <div className="users-detail">
                    <label>Admin:</label>
                    <p>{user.role === "admin" ? "Yes" : "No"}</p>
                  </div>
                <button className="view-profile-button" onClick={() => navigate(`/user-profile/${user.id}`)}>
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

function getUserAge(dob) {
  if (!dob) {
    console.warn("No date of birth provided."); 
    return null; 
  }

  let birthDate;

  
  if (dob instanceof Timestamp) {
    birthDate = dob.toDate();
  } else {
    birthDate = new Date(dob);
  }

  if (isNaN(birthDate)) {
    console.warn(`Invalid date format for dob: ${dob}`);
    return null; 
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDifference = today.getMonth() - birthDate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

export default AllUsers;