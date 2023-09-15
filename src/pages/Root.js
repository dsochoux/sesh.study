import React from "react";
import { Outlet } from "react-router-dom";
import MainNavigation from "../components/MainNavigation";
import { AuthProvider } from "../context/AuthContext";
import classes from './Root.module.css';
function Root(props) {
	return (
		<>
			<AuthProvider>
				<MainNavigation />
				<div className={classes.container}>
					{props.children}
					<Outlet />
				</div>
			</AuthProvider>
		</>
	);
}

export default Root;
