import React from "react";
import { useAuth } from "../context/AuthContext";

const SignInWithGoogleButton = () => {
	const {login} = useAuth();

	async function handleLogin() {
		try {
			await login();
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<button
			style={{
				background: "#DB4437",
				color: "#fff",
				padding: "10px 20px",
				borderRadius: "4px",
				border: "none",
				fontSize: "16px",
				fontWeight: "bold",
				cursor: "pointer",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				boxShadow: "0 2px 4px rgba(0, 0, 0, 0.25)",
			}} onClick={handleLogin}
		>
			<img
				src="/google-icon.png"
				alt="Google Icon"
				style={{
					marginRight: "10px",
					width: "30px",
					height: "30px",
					backgroundColor: "white",
					padding: "2px",
					borderRadius: "4px"
				}}
			/>
			Sign in with your Google .edu account
		</button>
	);
};

export default SignInWithGoogleButton;
