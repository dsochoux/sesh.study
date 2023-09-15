import React, { useContext, useState, useEffect } from "react";
import { auth, signInWithGoogle } from "../util/firebase";
// import { getUserData } from "../util/queries";
import { signOut } from "firebase/auth";

const AuthContext = React.createContext();

export function useAuth() {
	return useContext(AuthContext);
}

export function AuthProvider({ children }) {
	const [currentUser, setCurrentUser] = useState();
	const [loading, setLoading] = useState(true);

	function login() {
		return signInWithGoogle();
	}
	function logout() {
		return signOut(auth);
	}

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged((user) => {
			setCurrentUser(user);
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	const value = {
		currentUser,
		login,
		logout,
	};

	return (
		<AuthContext.Provider value={value}>
			{!loading ? children : <p>Loading...</p>}
		</AuthContext.Provider>
	);
}
