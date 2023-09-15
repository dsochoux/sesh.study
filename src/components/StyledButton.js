import React from "react";
import classes from './StyledButton.module.css';

function StyledButton(props) {
	return (
		<button className={classes.styledButton}
			onClick={props.action}
			disabled={props.disabled}
			style={{
				color: props.textColor,
				backgroundColor: props.backgroundColor,
			}}
			title={props.title ? props.title : ""}
		>
			{props.text}
		</button>
	);
}

export default StyledButton;
