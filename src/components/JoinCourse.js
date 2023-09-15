import { useEffect, useState } from "react";
import Course from "./Course";
import classes from "./JoinCourse.module.css";
import { joinCourse, createCourse } from "../util/queries";
import { useAuth } from "../context/AuthContext";

export default function JoinCoursePage(props) {
	const [enteredCourseName, setEnteredCourseName] = useState("");
	const [filteredCourses, setFilteredCourses] = useState([]);
	const { currentUser } = useAuth();

	async function createAndJoinHandler(courseName) {
		try {
			const newCourseId = await createCourse(courseName, currentUser.uid, currentUser.email);
			await joinHandler(newCourseId);
			window.location.reload();
		} catch (error) {
			console.log(error);
		}
	}
	async function joinHandler(cid) {
		try {
			await joinCourse(currentUser.uid, cid);
			const updatedFilteredCourses = [];
			filteredCourses.map((course) => {
				updatedFilteredCourses.push({
					...course,
					numEnrolled: course.cid === cid ? course.numEnrolled + 1 : course.numEnrolled,
				});
			});
			setFilteredCourses(updatedFilteredCourses);
			props.refresh(cid, 1);
		} catch (error) {
			console.log(error);
		}
	}

	useEffect(() => {
		if (enteredCourseName === "") {
			setFilteredCourses([]);
		} else {
			let tempFiltered = [];
			// iterate through the courses and add to an array
			// each course where enteredCourseName is contained
			// within course.name
			props.uniCourses.forEach((course) => {
				if (course.name.includes(enteredCourseName)) {
					tempFiltered.push(course);
				}
			});
			setFilteredCourses(tempFiltered);
		}
	}, [enteredCourseName]);

	function courseNameChangedHandler(event) {
		setEnteredCourseName(event.target.value.trim().toUpperCase());
	}

	return (
		<div>
			<input
				placeholder="enter course name"
				value={enteredCourseName}
				onChange={courseNameChangedHandler}
				className={classes["course-input"]}
				style={{marginBottom: "5px"}}
			/>
			{enteredCourseName !== "" ? (
				<ul style={{ listStyle: "none" }}>
					{!props.uniCourses.some((course) => course.name === enteredCourseName) && (
						<li key={enteredCourseName}>
							<Course
								name={enteredCourseName}
								numEnrolled={0}
								buttonText="Create & join"
								color="#b041a9"
								actionDisabled={false}
								action={createAndJoinHandler.bind(null, enteredCourseName)}
							/>
							<p>Create this course & be the first to join!</p>
						</li>
					)}
					{filteredCourses.map((course) => {
						const alreadyEnrolled = props.enrolledCids.includes(course.cid);
						return (
							<li key={course.name}>
								<Course
									name={course.name}
									numEnrolled={course.numEnrolled}
									buttonText={alreadyEnrolled ? "Joined" : "Join"}
									color={alreadyEnrolled ? "#757575" : "green"}
									actionDisabled={alreadyEnrolled}
									action={alreadyEnrolled ? () => {} : joinHandler.bind(null, course.cid)}
								/>
							</li>
						);
					})}
				</ul>
			) : (
				<p>Start typing to find matching courses!</p>
			)}
		</div>
	);
}
