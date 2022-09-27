import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { ref, update } from "firebase/database";
import { AuthContext } from "../context/auth";
import { useHistory } from "react-router-dom";

const Navbar = () => {
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const handleSignout = async () => {
    var updates = {};
    updates["/users/" + auth.currentUser.uid + "/isOnline"] = false;
    await update(ref(db), updates);
    await signOut(auth);
    history.replace("/login");
  };
  return (
    <nav>
      <h3>
        <Link to="/">Realtime DB Demo</Link>
      </h3>
      <div>
        {user ? (
          <>
            <button className="btn" onClick={handleSignout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/register">Register</Link>
            <Link to="/login">Login</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
