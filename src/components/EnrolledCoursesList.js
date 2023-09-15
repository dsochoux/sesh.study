import React, { useEffect, useState } from "react";
import Course from "./Course";
import { dropCourse } from "../util/queries";
import { useAuth } from "../context/AuthContext";

function EnrolledCoursesList(props) {
	const [enrolledCourses, setEnrolledCourses] = useState([]);
	const [isDropping, setIsDropping] = useState(false);
	const { currentUser } = useAuth();

	async function dropHandler(cid) {
		try {
			await dropCourse(currentUser.uid, cid);
			// props.refresh();
			// instead of refreshing the data, lets just remove the course
			// from enrolledCourses
			const updatedCourses = enrolledCourses.filter((course) => course.cid !== cid);
			setEnrolledCourses(updatedCourses);
			props.refresh(cid, -1);
		} catch (error) {
			console.log(error);
			setIsDropping(false);
		}
		
	}

	useEffect(() => {
		let tempEnrolled = [];
		props.uniCourses.forEach((course) => {
			if (props.enrolledCids.includes(course.cid)) {
				tempEnrolled.push(course);
			}
		});
		setEnrolledCourses(tempEnrolled);
	}, []);

	return (
		<>
			{enrolledCourses.length > 0 ? (
				<ul style={{ listStyleType: "none" }}>
					{enrolledCourses.map((course) => {
						return (
							<li key={course.cid}>
								<Course
									name={course.name}
									numEnrolled={course.numEnrolled}
									buttonText="Drop"
									color="#b51818"
									actionDisabled={false}
									action={dropHandler.bind(null, course.cid)}
								/>
							</li>
						);
					})}
				</ul>
			) : (
				<p>Join courses and they will appear here!</p>
			)}
		</>
	);
}

export default EnrolledCoursesList;
