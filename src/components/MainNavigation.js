import React from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import classes from "./MainNavigation.module.css";
import StyledButton from "./StyledButton";
function MainNavigation() {
	const { currentUser, login, logout } = useAuth();
	const navigate = useNavigate();
	async function handleSignInWithGoogle() {
		try {
			await login();
		} catch (error) {
			console.log(error);
		}
	}

	async function handleLogout() {
		try {
			await logout();
			navigate("/");
		} catch (error) {
			console.log(error);
		}
	}

	return (
		<>
			<nav className={classes["main-nav"]}>
				<ul className={classes["nav-list"]}>
					{currentUser ? (
						<li className={`${classes["nav-item"]} ${classes.loggedInLogo}`}>
							<NavLink
								to="/"
								className={({ isActive }) => {
									return isActive
										? `${classes["nav-link"]} ${classes["nav-link-bold"]}`
										: classes["nav-link"];
								}}
								end
							>
								sesh.study
							</NavLink>
						</li>
					) : (
						<li className={`${classes["nav-item"]} ${classes.loggedOutLogo}`}>
							<NavLink
								to="/"
								className={({ isActive }) => {
									return isActive
										? `${classes["nav-link"]} ${classes["nav-link-bold"]}`
										: classes["nav-link"];
								}}
								end
							>
								sesh.study
							</NavLink>
						</li>
					)}
					{currentUser && (
						<li className={classes["nav-item"]}>
							<NavLink
								to="/sessions"
								className={({ isActive }) => {
									return isActive
										? `${classes["nav-link"]} ${classes["nav-link-bold"]}`
										: classes["nav-link"];
								}}
								end
							>
								study
							</NavLink>
						</li>
					)}
					{currentUser && (
						<li className={classes["nav-item"]}>
							<NavLink
								to="/create"
								className={({ isActive }) => {
									return isActive
										? `${classes["nav-link"]} ${classes["nav-link-bold"]}`
										: classes["nav-link"];
								}}
								end
							>
								create
							</NavLink>
						</li>
					)}
					{currentUser && (
						<li className={classes["nav-item"]}>
							<NavLink
								to="/account"
								className={({ isActive }) => {
									return isActive
										? `${classes["nav-link"]} ${classes["nav-link-bold"]}`
										: classes["nav-link"];
								}}
								end
							>
								account
							</NavLink>
						</li>
					)}
					{currentUser && (
						<li className={classes["nav-item"]}>
							<StyledButton
								text={"Logout"}
								textColor="black"
								backgroundColor="white"
								action={handleLogout}
							/>
						</li>
					)}
				</ul>
			</nav>
		</>
	);
}

export default MainNavigation;
