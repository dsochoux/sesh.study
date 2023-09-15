import React from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import StyledButton from "../components/StyledButton";

function Error() {
	const navigate = useNavigate();
	const { logout } = useAuth();
	async function handleLogout() {
		try {
			await logout();
			navigate("/");
		} catch (error) {
			throw error;
		}
	}
	return (
		<div style={{ textAlign: "center" }}>
			<h1>Something went wrong!</h1>
			<h2>Please try again.</h2>
			<h2>If trying again doesn't fix it, please logout and then try again.</h2>
			<StyledButton text={"Logout"} textColor="white" backgroundColor="red" action={handleLogout} />
		</div>
	);
}

export default Error;
