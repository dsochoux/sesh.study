import React from "react";
import classes from "./FilterButton.module.css";

function FilterButton(props) {
	const buttonClasses = `${classes.filterButton} ${props.enabled ? classes.enabled : classes.disabled}`
	return (
		<button className={buttonClasses} onClick={props.action}>
			{props.children}
		</button>
	);
}

export default FilterButton;
