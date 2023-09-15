import { useEffect, useState } from "react";
import { getListOfUsers, updateGroupDescription, updateGroupInformation, joinGroup, dropGroup } from "../util/queries";
import classes from "./StudyGroup.module.css";
import StyledButton from "./StyledButton";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useRef } from "react";
import { Timestamp } from "firebase/firestore";
import {
	getDateAfterDays,
	isWithinNDays,
	createFirestoreTimestamp,
	convertSecondsToTimeString,
	convertSecondsToDateString,
	formatTimestamps,
	generateGoogleCalendarLink
} from "../util/helper";



export default function StudyGroup(props) {
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [attendees, setAttendees] = useState([]);
	const [attendeeEmails, setAttendeeEmails] = useState([]);
	const [isLoadingAttendees, setIsLoadingAttendees] = useState(false);
	const [showingAttendees, setShowingAttendees] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	// editing related states
	const [isEditing, setIsEditing] = useState(false);

	// two sets of states.
	// when edits are made, and not committed, the edited states will refelct
	// those changes. when changes are updated, the normal states will be updated with
	// the edited states values.
	//the normal states will be used to set the display values
	// for the content.

	const dateRef = useRef();
	const startTimeRef = useRef();

	const [start, setStart] = useState(props.data.start);
	const [end, setEnd] = useState(props.data.end);
	const [description, setDescription] = useState(props.data.description);

	const [editedStart, setEditedStart] = useState(props.data.start);
	const [editedEnd, setEditedEnd] = useState(props.data.end);
	const [editedDescription, setEditedDescription] = useState(props.data.description);

	const [changesMade, setChangesMade] = useState(false);
	const [isValidUpdate, setIsValidUpdate] = useState(true);

	function editClickedHandler(event) {
		event.preventDefault();
		if (props.data.attendees.length === 1) {
			setEditedStart(start);
			setEditedEnd(end);
		}

		setEditedDescription(description);
		setIsEditing(true);
	}

	function cancelClickedHandler(event) {
		event.preventDefault();
		setIsEditing(false);
	}

	async function showAttendeeHandler(event) {
		event.preventDefault();

		setShowingAttendees((prevState) => {
			return !prevState;
		});

		if (attendees.length === 0) {
			setIsLoadingAttendees(true);
			const attendeeDetails = await getListOfUsers(props.data.attendees);
			setAttendees(attendeeDetails);
			let aems = [];
			attendeeDetails.map((attendee) => {
				if (attendee.email != currentUser.email) {
					aems.push(attendee.email);
				}
			});
			setAttendeeEmails(aems);
			setIsLoadingAttendees(false);
		}
	}

	async function joinGroupHandler(gid) {
		setIsProcessing(true);
		try {
			await joinGroup(currentUser.uid, gid);
			await props.refresh();
			navigate("/sessions?filter=attending");
		} catch (error) {
			alert("Joining the group has failed, something has gone wrong. Please try again.");
		}
		setIsProcessing(false);
	}

	async function flakeGroupHanlder(gid, cid) {
		setIsProcessing(true);
		try {
			// uid, gid, cid
			await dropGroup(currentUser.uid, gid, cid);
			await props.refresh();
			navigate("/sessions?filter=attending");
		} catch (error) {
			alert("Flaking the group has failed, something has gone wrong. Please try again.")
		}
		setIsProcessing(false);
	}

	async function updateClickedHandler(event) {
		event.preventDefault();
		if (props.data.attendees.length === 1) {
			// update full event
			try {
				await updateGroupInformation(props.data.gid, editedStart, editedEnd, editedDescription);
				setStart(editedStart);
				setEnd(editedEnd);
				setDescription(editedDescription);
				setIsEditing(false);
				setChangesMade(false);
			} catch (error) {
				// throw error;
				setIsEditing(false);
				setChangesMade(false);
				alert("Updating the date/time has failed most likely because another student has recently just commited to the group!");
				window.location.reload(); // refreshes the page for the user to see the new group memeber show up
			}
		} else {
			// just update the description
			try {
				await updateGroupDescription(props.data.gid, editedDescription);
				setDescription(editedDescription);
				setIsEditing(false);
				setChangesMade(false);
			} catch (error) {
				alert("Update failed, something has gone wrong. Please try again.")
			}
		}
	}

	function dateChangedHandler(event) {
		setEditedStart(createFirestoreTimestamp(event.target.value, startTimeRef.current.value));
	}

	useEffect(() => {
		if (props.data.attendees.length === 1) {
			if (!dateRef.current) {
				return;
			}
			setIsValidUpdate(isWithinNDays(dateRef.current.value, 30) && editedDescription !== "");
			setChangesMade(
				editedStart.seconds !== start.seconds || editedEnd.seconds !== end.seconds || editedDescription !== description
			);
		} else {
			setIsValidUpdate(editedDescription !== "");
			setChangesMade(editedDescription !== description);
		}
	}, [editedStart, editedEnd, editedDescription]);

	return (
		<>
			<div className={classes.groupContainer}>
				<div className={classes.detailsContainer}>
					<h3>{props.data.courseName}</h3>
					{/* Time details */}
					{!(isEditing && props.data.attendees.length === 1) ? (
						<div>
							<p>
								<span className={classes.infoLabel}>When: </span>
								{formatTimestamps(start, end)}
								<span> </span>
								{props.attending && (
									<a
										href={generateGoogleCalendarLink(
											`${props.data.courseName} study session`,
											description,
											start,
											end
										)}
									>
										google calendar
									</a>
								)}
							</p>

							{isEditing && (
								<p style={{ color: "red" }}>
									Note: the date and time cannot be changed since other students have already
									committed to them.
								</p>
							)}
						</div>
					) : (
						<div className={classes.updateDatetimeContainer}>
							<p>
								<span className={classes.infoLabel}>Date: </span>
								<input
									type="date"
									value={convertSecondsToDateString(editedStart.seconds)}
									onChange={dateChangedHandler}
									ref={dateRef}
									min={getDateAfterDays(0)}
									max={getDateAfterDays(30)}
									id="dateInput"
								/>
							</p>
							<p>
								<span className={classes.infoLabel}>Time: </span>
								<input
									type="time"
									value={convertSecondsToTimeString(editedStart.seconds)}
									ref={startTimeRef}
									onChange={(event) => {
										setEditedStart(
											createFirestoreTimestamp(
												dateRef.current.value,
												event.target.value
											)
										);
									}}
								/>
								-
								<input
									type="time"
									value={convertSecondsToTimeString(editedEnd.seconds)}
									onChange={(event) => {
										setEditedEnd(
											createFirestoreTimestamp(
												dateRef.current.value,
												event.target.value
											)
										);
									}}
								/>
							</p>
						</div>
					)}

					{/* Description */}
					{!isEditing ? (
						<p>
							<span className={classes.infoLabel}>What & where: </span>
							{description}
						</p>
					) : (
						<div>
							<p className={classes.infoLabel}>What & where: </p>
							<textarea
								value={editedDescription}
								style={{ fontSize: "inherit", width: "100%", height: "10em" }}
								onChange={(event) => {
									setEditedDescription(event.target.value);
								}}
							/>
						</div>
					)}
					{/* Attendee details */}
					{!isEditing && (
						<p>
							<span className={classes.infoLabel}>Attending: </span>
							{props.data.attendees.length}
							<a onClick={showAttendeeHandler} className={classes.attendeeLink}>
								{showingAttendees ? "hide" : "show"}
							</a>
						</p>
					)}
					{showingAttendees && isLoadingAttendees && !isEditing && <p>Loading attendees...</p>}
					{showingAttendees && !isLoadingAttendees && !isEditing && (
						<ul className={classes.attendeeList}>
							{attendees.map((attendee, i) => {
								return (
									<li key={attendee.email}>
										{attendee.email === currentUser.email ? (
											<p>{`${attendee.name} (you)`}</p>
										) : (
											<p>
												{`${attendee.name}, `}
												<a href={`mailto:${attendee.email}`}>
													{attendee.email}
												</a>
											</p>
										)}
									</li>
								);
							})}
							<li>
								{attendeeEmails.length > 1 && (
									<a href={`mailto:${attendeeEmails.map((email) => `${email}, `)}`}>
										Send an email to everybody
									</a>
								)}
							</li>
						</ul>
					)}
				</div>
				<div className={classes.actionButtons}>
					{isEditing ? (
						<StyledButton
							text="Update"
							action={updateClickedHandler}
							actionDisabled={!(changesMade && isValidUpdate)}
							textColor="white"
							backgroundColor={changesMade && isValidUpdate ? "green" : "grey"}
						/>
					) : (
						<StyledButton
							text={isProcessing ? "..." : props.attending ? "Flake" : "Commit"}
							action={
								props.attending
									? flakeGroupHanlder.bind(null, props.data.gid, props.data.cid)
									: joinGroupHandler.bind(null, props.data.gid)
							}
							actionDisabled={isProcessing}
							textColor="white"
							backgroundColor={isProcessing ? "grey" : !props.attending ? "green" : "#b51818"}
						/>
					)}

					{props.data.attendees[0] === currentUser.uid && (
						<StyledButton
							text={isEditing ? "Cancel" : "Edit"}
							action={isEditing ? cancelClickedHandler : editClickedHandler}
							textColor="white"
							backgroundColor={isEditing ? "#b51818" : "blue"}
						/>
					)}
				</div>
			</div>
		</>
	);
}
