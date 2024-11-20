import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import Header from "./Header";
import "./FlatDetails.css";
import Back from "./back.jpg";

function FlatDetails() {
  const { flatId } = useParams();
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);
  const [tooManyDetails, setTooManyDetails] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const fetchFlatDetails = async () => {
        if (user) {
          const userDocRef = doc(db, "users", user.uid);
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            const userData = userDoc.data();
            const flatArr = userData.flats || [];
            const currentFlat = flatArr.find((f) => String(f.id) === flatId);

            if (currentFlat) {
              const detailCount = Object.keys(currentFlat).length;

              if (detailCount > 10) {
                setTooManyDetails(true);
              } else {
                setFlat(currentFlat);
              }
            } else {
              setError("Flat not found.");
            }
          } else {
            setError("User data not found.");
          }
        }
        setLoading(false);
      };

      fetchFlatDetails();
    });

    return () => unsubscribe();
  }, [flatId]);

  if (loading) {
    return <p>Loading flat details...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (tooManyDetails) {
    return <p>Too many details to display.</p>;
  }

  return (
    <div>
      <Header />
      <h2>Flat Details</h2>
      {flat && (
        <div className="details-container">
          <div className="flat-card">
            <table>
              <tbody>
                <tr>
                  <td className="first-td">
                    <strong>City</strong>
                  </td>
                  <td>{flat.city}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Street Name</strong>
                  </td>
                  <td>{flat.streetName}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Street Number</strong>
                  </td>
                  <td>{flat.streetNumber}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Area Size</strong>
                  </td>
                  <td>{flat.areaSize}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Has AC</strong>
                  </td>
                  <td>{flat.hasAC ? "Yes" : "No"}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Year Built</strong>
                  </td>
                  <td>{flat.yearBuilt}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Rent Price</strong>
                  </td>
                  <td>{flat.rentPrice}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Date Available</strong>
                  </td>
                  <td>{flat.dateAvailable}</td>
                </tr>
              </tbody>
            </table>
            <button
              className="back-button"
              onClick={() => navigate("/homepage")}
            >
              <img src={Back} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlatDetails;
