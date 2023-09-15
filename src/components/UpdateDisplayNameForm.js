import { useState } from "react";
import { db } from "../util/firebase";
import { doc, updateDoc } from "firebase/firestore";
import classes from "./UpdateDisplayNameForm.module.css";
import StyledButton from "./StyledButton";

export default function UpdateDisplayNameForm({ name, uid, refresh }) {
	const [savedName, setSavedName] = useState(name);
	const [enteredName, setEnteredName] = useState(name);
	const [updating, setUpdating] = useState(false);
	function nameChangeHandler(event) {
		setEnteredName(event.target.value.trim());
	}
	async function updateDisplayNameHandler(event) {
		setUpdating(true);
		event.preventDefault();
		try {
			const userRef = doc(db, "users", uid);
			await updateDoc(userRef, {
				name: enteredName.trim(),
			});
			setSavedName(enteredName.trim());
		} catch (error) {
			console.log(error);
		}
		setUpdating(false);
	}
	const isDisabled = savedName === enteredName.trim() || updating || enteredName.trim() === "";
	return (
		<div className={classes.updateNameContainer}>
			<form className={classes.updateNameForm}>
				<input
					defaultValue={name}
					name="displayName"
					id="displayName"
					onChange={nameChangeHandler}
					className={classes.displayNameInput}
				/>
				<StyledButton
					text={updating ? "Updating..." : "Update"}
					action={updateDisplayNameHandler}
					disabled={isDisabled}
					textColor="white"
					backgroundColor={isDisabled ? "#757575" : "green"}
				/>
			</form>
		</div>
	);
}
