import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase";
import SendMessage from "./SendMessage";
import SignOut from "./SignOut";
import { ref, onValue } from "firebase/database";

function Chat() {
  const scroll = useRef();
  const { uid } = auth.currentUser;
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    onValue(ref(db, "/messages/" + uid), snapshot => {
      setMessages(snapshot.docs.map(doc => doc.val()));
    });
  }, []);
  return (
    <div>
      <SignOut />
      <div className="msgs">
        {messages.map(({ id, text, photoURL, uid }) => (
          <div>
            <div
              key={id}
              className={`msg ${
                uid === auth.currentUser.uid ? "sent" : "received"
              }`}
            >
              <img src={photoURL} alt="" />
              <p>{text}</p>
            </div>
          </div>
        ))}
      </div>
      <SendMessage scroll={scroll} />
      <div ref={scroll}></div>
    </div>
  );
}

export default Chat;
