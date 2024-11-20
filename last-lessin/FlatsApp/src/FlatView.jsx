import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, updateDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import Header from './Header';
import "./FlatDetails.css";

function FlatView() {
  const { flatId } = useParams();
  const [flat, setFlat] = useState(null);
  const [groupedMessages, setGroupedMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [replyContents, setReplyContents] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        try {
          const usersSnapshot = await getDocs(collection(db, "users"));
          const allFlats = [];
          for (const userDoc of usersSnapshot.docs) {
            const userData = userDoc.data();
            const userFlats = userData.flats || [];
            userFlats.forEach((flat) => {
              allFlats.push({
                id: flat.id,
                ...flat,
                ownerId: userDoc.id,
                ownerEmail: userData.email,
                messages: userData.messages ? userData.messages[flat.id] || [] : [],
              });
            });
          }

          const currentFlat = allFlats.find((f) => String(f.id) === flatId);
          if (currentFlat) {
            setFlat(currentFlat);
            filterMessagesForCurrentUser(currentFlat.messages, user.uid, currentFlat.ownerId);
          } else {
            setError("Flat not found.");
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Error fetching data.");
        }
      } else {
        setError("User not authenticated.");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [flatId]);

  const filterMessagesForCurrentUser = (messages, userId, ownerId) => {
    const filteredMessages = messages.filter(
      (message) => message.senderId === userId || ownerId === userId
    );
    groupMessagesByEmail(filteredMessages);
  };

  const groupMessagesByEmail = (messages) => {
    const grouped = messages.reduce((acc, message) => {
      const { senderEmail } = message;
      if (!acc[senderEmail]) {
        acc[senderEmail] = [];
      }
      acc[senderEmail].push(message);
      return acc;
    }, {});
    setGroupedMessages(grouped);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const message = {
      content: newMessage,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderEmail: currentUser.email,
      timestamp: new Date().toISOString(),
      replies: []
    };

    try {
      const userRef = doc(db, "users", flat.ownerId);
      await updateDoc(userRef, {
        [`messages.${flatId}`]: arrayUnion(message),
      });

      setGroupedMessages((prevGrouped) => {
        const updatedGrouped = { ...prevGrouped };
        updatedGrouped[currentUser.email] = [
          ...(updatedGrouped[currentUser.email] || []),
          message
        ];
        return updatedGrouped;
      });
      setNewMessage("");
    } catch (err) {
      console.error("Error saving message:", err);
      setError("Error saving message.");
    }
  };

  const handleSendReply = async (message) => {
    const replyContent = replyContents[message.timestamp];

    if (!replyContent || !replyContent.trim()) return;

    const reply = {
      content: replyContent,
      senderId: currentUser.uid,
      senderName: currentUser.displayName,
      senderEmail: currentUser.email,
      timestamp: new Date().toISOString(),
    };

    try {
      const userRef = doc(db, "users", flat.ownerId);
      await updateDoc(userRef, {
        [`messages.${flatId}`]: arrayRemove(message),
      });
      await updateDoc(userRef, {
        [`messages.${flatId}`]: arrayUnion({
          ...message,
          replies: [...(message.replies || []), reply],
        }),
      });


      setGroupedMessages((prevGrouped) => {
        const updatedGrouped = { ...prevGrouped };
        updatedGrouped[message.senderEmail] = updatedGrouped[message.senderEmail].map((msg) => {
          if (msg.timestamp === message.timestamp) {
            return { ...msg, replies: [...(msg.replies || []), reply] };
          }
          return msg;
        });
        return updatedGrouped;
      });
      setReplyContents((prev) => ({ ...prev, [message.timestamp]: "" }));
    } catch (err) {
      console.error("Error saving reply:", err);
      setError("Error saving reply.");
    }
  };

  const handleReplyChange = (message, value) => {
    setReplyContents((prev) => ({ ...prev, [message.timestamp]: value }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  const isOwner = currentUser && flat && flat.ownerId === currentUser.uid;

  return (
    <div>
      <Header />
      <h2>Flat Details</h2>
      {flat && (
        <div className="details-container">
          <div className="flat-card">
            <table>
              <tbody>
                <tr><td><strong>Owner email</strong></td><td>{flat.ownerEmail}</td></tr>
                <tr><td><strong>City</strong></td><td>{flat.city}</td></tr>
                <tr><td><strong>Street Name</strong></td><td>{flat.streetName}</td></tr>
                <tr><td><strong>Street Number</strong></td><td>{flat.streetNumber}</td></tr>
                <tr><td><strong>Area Size</strong></td><td>{flat.areaSize}</td></tr>
                <tr><td><strong>Has AC</strong></td><td>{flat.hasAC ? "Yes" : "No"}</td></tr>
                <tr><td><strong>Year Built</strong></td><td>{flat.yearBuilt}</td></tr>
                <tr><td><strong>Rent Price</strong></td><td>{flat.rentPrice}</td></tr>
                <tr><td><strong>Date Available</strong></td><td>{flat.dateAvailable}</td></tr>
              </tbody>
            </table>
            {isOwner && (
              <button className="btn-edit" onClick={() => navigate(`/edit-flat/${flatId}`)}>Edit flat</button>
            )}
          </div>
        </div>
      )}
  
      <h2>Messages</h2>
      <div className="message-container">
        <ul>
          {Object.entries(groupedMessages).map(([senderEmail, messages], index) => (
            <li key={`${senderEmail}-${index}`}>
              <p>From: {messages[0].senderName} ({senderEmail})</p>
              <ul>
                {messages.map((message, index) => (
                  <li key={`${message.timestamp}-${index}`}>
                    <p>{message.content}</p>
                    <em>{new Date(message.timestamp).toLocaleString()}</em>
                    {isOwner && (
                      <div className="reply-container">
                        <textarea
                          value={replyContents[message.timestamp] || ""}
                          onChange={(e) => handleReplyChange(message, e.target.value)}
                          placeholder="Type your reply..."
                        />
                        <button 
                          className="btnx-submit" 
                          onClick={() => handleSendReply(message)} 
                          disabled={!replyContents[message.timestamp]?.trim()}
                        >
                          Reply
                        </button>
                      </div>
                    )}
                    {message.replies && message.replies.length > 0 && (
                      <ul>
                        {message.replies.map((reply, replyIndex) => (
                          <li key={`${reply.timestamp}-${replyIndex}`}>
                            <p><strong>Reply:</strong> {reply.content}</p>
                            <p>
                              From: {reply.senderName} ({reply.senderEmail}) -{" "}
                              <em>{new Date(reply.timestamp).toLocaleString()}</em>
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
        {!isOwner && (
          <div className="message-input">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
            />
            <button className="btnx-submit" onClick={handleSendMessage} disabled={!newMessage.trim()}>
              Send Message
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default FlatView;