import React, { useState } from "react";
import classes from "./Course.module.css";
import StyledButton from "./StyledButton";
import { useNavigate } from "react-router-dom";

function Course(props) {
	const navigate = useNavigate();
	const [loading, setLoading] = useState(false);
	async function buttonClickedHandler() {
		setLoading(true);
		await props.action();
		setLoading(false);
	}
	function goToSessions() {
		navigate(`/sessions?filter=${props.name}`);
	}
	return (
		// <div>
		// 	{props.name}, {props.numEnrolled} {props.numEnrolled === 1 ? 'student' : 'students'}
		// </div>
		<div className={classes.courseCard}>
			<div className={classes["left-content"]}>
				<h3 onClick={goToSessions}>{props.name}</h3>
				<div className={classes.number}>
					{props.numEnrolled} {props.numEnrolled === 1 ? "student" : "students"} enrolled
				</div>
			</div>
			<StyledButton
				action={buttonClickedHandler}
				disabled={props.actionDisabled || loading}
				textColor="white"
				backgroundColor={props.color}
				text={loading ? "..." : props.buttonText}
				title={`Dropping ${props.name} will remove you from any related study sessions`}
			/>
		</div>
	);
}

export default Course;
