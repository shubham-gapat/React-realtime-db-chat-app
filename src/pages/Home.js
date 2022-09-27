import React, { useEffect, useState } from "react";
import { db, auth, storage } from "../firebase";
import { ref, onValue, set, get, update, push } from "firebase/database";
import { getDownloadURL, uploadBytes } from "firebase/storage";
import User from "../components/User";
import MessageForm from "../components/MessageForm";
import Message from "../components/Message";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [chat, setChat] = useState("");
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [msgs, setMsgs] = useState([]);

  const user1 = auth.currentUser.uid;

  useEffect(() => {
    const unsub = onValue(ref(db, "/users"), docs => {
      let users = [];
      docs.forEach(doc => {
        if (doc.val().uid !== user1) {
          users.push(doc.val());
        }
      });
      setUsers(users);
    });
    return () => unsub();
  }, []);

  const selectUser = async user => {
    setChat(user);

    const user2 = user.uid;
    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    const msgsRef = ref(db, "/messages/" + id + "/chat");

    onValue(msgsRef, querySnapshot => {
      let msgs = [];
      querySnapshot.forEach(doc => {
        msgs.push(doc.val());
      });
      setMsgs(msgs);
    });

    // get last message b/w logged in user and selected user
    const docSnap = await get(ref(db, "/lastMsg/" + id));
    // if last message exists and message is from selected user
    if (docSnap.val() && docSnap.val().from !== user1) {
      // update last message doc, set unread to false
      var updates = {};
      updates["/lastMsg/" + id] = { unread: false };
      await update(ref(db), updates);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const user2 = chat.uid;

    const id = user1 > user2 ? `${user1 + user2}` : `${user2 + user1}`;

    let url;
    if (img) {
      const imgRef = ref(
        storage,
        `images/${new Date().getTime()} - ${img.name}`
      );
      const snap = await uploadBytes(imgRef, img);
      const dlUrl = await getDownloadURL(ref(storage, snap.ref.fullPath));
      url = dlUrl;
    }

    await push(ref(db, "/messages/" + id + "/chat"), {
      text,
      from: user1,
      to: user2,
      createdAt: new Date().toUTCString(),
      media: url || "",
    });

    await set(ref(db, "/lastMsg/" + id), {
      text,
      from: user1,
      to: user2,
      createdAt: new Date().toUTCString(),
      media: url || "",
      unread: true,
    });

    setText("");
    setImg("");
  };
  return (
    <div className="home_container">
      <div className="users_container">
        {users.map(user => (
          <User
            key={user.uid}
            user={user}
            selectUser={selectUser}
            user1={user1}
            chat={chat}
          />
        ))}
      </div>
      <div className="messages_container">
        {chat ? (
          <>
            <div className="messages_user">
              <h3>{chat.name}</h3>
            </div>
            <div className="messages">
              {msgs.length
                ? msgs.map((msg, i) => (
                    <Message key={i} msg={msg} user1={user1} />
                  ))
                : null}
            </div>
            <MessageForm
              handleSubmit={handleSubmit}
              text={text}
              setText={setText}
              setImg={setImg}
            />
          </>
        ) : (
          <h3 className="no_conv">Select a user to start conversation</h3>
        )}
      </div>
    </div>
  );
};

export default Home;
