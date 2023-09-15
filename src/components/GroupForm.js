import React, { useEffect, useState } from "react";
import classes from "./GroupForm.module.css";
import StyledButton from "./StyledButton";
import { Timestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createGroup} from "../util/queries";
import {getDateAfterDays, isWithinNDays, getCurrentTime, addMinutesToTime, calculateMinutesBetween, calculateTimeDifference} from '../util/helper';

function GroupForm(props) {
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [selectedCourse, setSelectedCourse] = useState({});
	const [courseInputValidityClass, setCourseInputValidityClass] = useState(classes["invalid-input"]);
	const [date, setDate] = useState(getDateAfterDays(0));
	const [dateInputValidityClass, setDateInputValidityClass] = useState(classes["valid-input"]);
	const [startTime, setStartTime] = useState(getCurrentTime());
	const [startTimeInputValidityClass, setStartTimeInputValidityClass] = useState(classes["valid-input"]);
	const [endTime, setEndTime] = useState("");
	const [endTimeInputValidityClass, setEndTimeInputValidityClass] = useState(classes["invalid-input"]);
	const [duration, setDuration] = useState("0h");
	const [description, setDescription] = useState("");
	const [descriptionInputValidityClass, setDescriptionInputValidityClass] = useState(classes["invalid-input"]);
	const [isValid, setIsValid] = useState(false);
	const [isCreating, setIsCreating] = useState(false);

	function courseChangedHandler(event) {
		const selectedOption = event.target.options[event.target.selectedIndex];
		const selectedOptionText = selectedOption.text;
		const selectedOptionValue = selectedOption.value;
		setSelectedCourse({
			courseName: selectedOptionText,
			cid: selectedOptionValue,
		});
	}

	function dateChangedHandler(event) {
		setDate(event.target.value);
	}

	function startTimeChangedHandler(event) {
		setStartTime(event.target.value);
	}

	function endTimeChangedHandler(event) {
		setEndTime(event.target.value);
	}

	function incrementClickedHandler(mins, event) {
		event.preventDefault();
		if (startTime === "") {
			// set startTime to current, and endTime to current + mins
			setStartTime(getCurrentTime());
			setEndTime(addMinutesToTime(getCurrentTime(), mins));
		} else if (endTime === "") {
			// if the end time is blank, add mins to the start time
			setEndTime(addMinutesToTime(startTime, mins));
		} else {
			// both have values, just increment the end time
			setEndTime(addMinutesToTime(endTime, mins));
		}
	}

	function descriptionChangedHandler(event) {
		setDescription(event.target.value);
	}

	async function createHandler(event) {
		event.preventDefault();

		// create the starting datetime
		const combinedStartDatetime = new Date(`${date}T${startTime}`);
		const startTimestamp = Timestamp.fromDate(combinedStartDatetime);

		// if the end time is less than the start time, then we must
		// have the end date be the next day. otherwise, we keep the same day
		let combinedEndDatetime = new Date(`${date}T${endTime}`);
		if (combinedEndDatetime < combinedStartDatetime) {
			// the end date must be the next day
			combinedEndDatetime.setDate(combinedEndDatetime.getDate() + 1);
		}
		// here, in an else block, you might want to do some validation such as
		// setting the minimum for a study group to an hour or something
		const endTimestamp = Timestamp.fromDate(combinedEndDatetime);
		setIsCreating(true);
		const newGid = await createGroup(currentUser.uid, selectedCourse.cid, {
			description: description,
			start: startTimestamp,
			end: endTimestamp,
			courseName: selectedCourse.courseName,
		});
		setIsCreating(false);
		navigate("/sessions?filter=attending");
	}

	async function editHandler(event) {
		event.preventDefault();
	}

	useEffect(() => {
		if (startTime === "" || endTime === "") {
			setDuration("0h");
		} else {
			setDuration(calculateTimeDifference(startTime, endTime));
		}
	}, [startTime, endTime]);

	useEffect(() => {
		// let valid = Object.keys(selectedCourse).length !== 0 && date !== "" && startTime !== "" && endTime !== "" && description !== "";
		// if (!valid) {
		// 	setIsValid(false);
		// } else {
		// 	valid = isWithinNDays(date, 30) && calculateMinutesBetween(startTime, endTime) >= 30;
		// 	setIsValid(valid);
		// }

		let valid = true;
		if (Object.keys(selectedCourse).length !== 0) {
			setCourseInputValidityClass(classes["valid-input"]);
		} else {
			valid = false;
			setCourseInputValidityClass(classes["invalid-input"]);
		}
		if (date !== "" && isWithinNDays(date, 30)) {
			setDateInputValidityClass(classes["valid-input"]);
		} else {
			valid = false;
			setDateInputValidityClass(classes["invalid-input"]);
		}
		if (startTime !== "" && endTime !== "" && calculateMinutesBetween(startTime, endTime) >= 30) {
			setStartTimeInputValidityClass(classes["valid-input"]);
			setEndTimeInputValidityClass(classes["valid-input"]);
		} else {
			if (startTime !== "" && endTime !== "") {
				// the duration is the thing that is wrong, show the endTime to be invalid
				// and display a message as to why
				setEndTimeInputValidityClass(classes["invalid-input"]);
				valid = false;
			} else {
				// either the start time or the end time is wrong
				setStartTimeInputValidityClass(startTime !== "" ? classes["valid-input"] : classes["invalid-input"]);
				setEndTimeInputValidityClass(endTime !== "" ? classes["valid-input"] : classes["invalid-input"]);
				valid = false;
			}
		}
		if (description !== "") {
			setDescriptionInputValidityClass(classes["valid-input"]);
		} else {
			setDescriptionInputValidityClass(classes["invalid-input"]);
			valid = false;
		}
		setIsValid(valid);

	}, [selectedCourse, date, startTime, endTime, description]);

	return (
		<div>
			<form className={classes.groupForm}>
				<div className={classes.section}>
					<label htmlFor="courseSelect">Course</label>
					<select id="courseSelect" defaultValue="" className={`${classes.courseSelect} ${courseInputValidityClass}`} onChange={courseChangedHandler}>
						<option key="" value="" disabled>
							choose
						</option>
						{props.courses.map((course) => {
							return (
								<option key={course.cid} value={course.cid}>
									{course.name}
								</option>
							);
						})}
					</select>
				</div>
				<div className={classes.section}>
					<label>Date</label>
					<input
						type="date"
						value={date}
						onChange={dateChangedHandler}
						min={getDateAfterDays(0)}
						max={getDateAfterDays(30)}
						className={dateInputValidityClass}
						required
					/>
				</div>
				<div className={`${classes.section} ${classes.timeControl}`}>
					<label>Time</label>
					<input type="time" value={startTime} onChange={startTimeChangedHandler} className={startTimeInputValidityClass}/>
					<label>-</label>
					<input type="time" value={endTime} onChange={endTimeChangedHandler} className={endTimeInputValidityClass}/>
				</div>
				<div className={`${classes.section} ${classes.timeHelpers}`}>
					<button onClick={incrementClickedHandler.bind(null, -30)}>-30</button>
					<button onClick={incrementClickedHandler.bind(null, 30)}>+30</button>
					<p>Duration: {duration}</p>
				</div>
				<div className={`${classes.section} ${classes.description}`}>
					<label>Description & location</label>
					<textarea
						placeholder="What will you be working on? Where can you be found?"
						value={description}
						onChange={descriptionChangedHandler}
						className={descriptionInputValidityClass}
					/>
				</div>
				<div className={classes.section}>
					{isValid ? (
						<StyledButton
							text={isCreating ? "Creating..." : "Create session"}
							textColor="white"
							backgroundColor="darkslategrey"
							action={props.creating ? createHandler : editHandler}
							actionDisabed={false}
						/>
					) : (
						<StyledButton
							text="Create session"
							textColor="grey"
							backgroundColor="lightgrey"
							action={(event) => {
								event.preventDefault();
							}}
							actionDisabed={true}
						/>
					)}
				</div>
			</form>
			<p>
				Note: editing capabilities are granted to the attendee with the longest commitment to allow scheduled study sessions to
				update location information when the time comes. As the creator, you have initial editing rights.
			</p>
		</div>
	);
}

export default GroupForm;
