import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUniversityCourses, getUserData } from "../util/queries";
import UpdateDisplayNameForm from "../components/UpdateDisplayNameForm";
import EnrolledCoursesList from "../components/EnrolledCoursesList";
import JoinCoursePage from "../components/JoinCourse";
import classes from "./Account.module.css";

export default function AccountPage() {
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [userData, setUserData] = useState(); // object containing user's data
	const [universityCourses, setUniversityCourses] = useState([]); // array containing all courses at user's university
	const [isLoading, setIsLoading] = useState(true);
	const [showingEnrolled, setShowingEnrolled] = useState(true); // state to determine which mode to show (enrolled / join)

	// fetches the user's data from the db as well as
	// all courses from their university
	async function fetchUserData() {
		setIsLoading(true);
		try {
			const userDataRes = await getUserData(currentUser.uid);
			setUserData(userDataRes);
			const uniCoursesRes = await getUniversityCourses(currentUser.uid);
			setUniversityCourses(uniCoursesRes);
			setIsLoading(false);
		} catch (error) {
			console.log(error);
			setIsLoading(false);
		}
		setShowingEnrolled(true);
	}

	// this function is envoked when a course is either joined or dropped (NOT when created & joined)
	// it is used to represent joins/drops locally instead of requerying the db
	// this was more difficult to implement with the create&join option. Because creates will happen less
	// often over time than joins and drops, i felt it was okay to omit.
	function changeNumEnrolled(cid, num) {
		let updatedEnrolledCourses = userData.courses;
		// if the course <cid> was dropped
		if (num === -1) {
			// locally remove the course from the user's courses array (part of userData object)
			updatedEnrolledCourses = updatedEnrolledCourses.filter((coursecid) => coursecid !== cid);
			setUserData((ud) => {
				return {
					...ud,
					courses: updatedEnrolledCourses,
				};
			});
		} else if (num === 1) {
			// if the course <cid> was joined, locally add it to the user's courses array
			updatedEnrolledCourses.push(cid);
			setUserData((ud) => {
				return {
					...ud,
					courses: updatedEnrolledCourses,
				};
			});
		}

		// locally update the numEnrolled property of the course obejct in the universityCouses array
		let updatedCourses = [];
		universityCourses.map((course) => {
			if (course.cid === cid) {
				updatedCourses.push({
					...course,
					numEnrolled: course.numEnrolled + num,
				});
			} else {
				updatedCourses.push(course);
			}
		});
		setUniversityCourses(updatedCourses);
	}

	function enrolledClickedHandler() {
		setShowingEnrolled(true);
	}
	function joinClickedHandler() {
		setShowingEnrolled(false);
	}

	useEffect(() => {
		//protect the route
		if (!currentUser) {
			navigate("/");
		} else {
			fetchUserData();
		}
	}, []);

	return (
		<div className={classes.accountWrapper}>
			<h1>Hello, {currentUser.email}</h1>
			{isLoading && <p>Loading account details...</p>}
			{!isLoading && (
				<div>
					<div className={classes.accountPageCard}>
						<h2 style={{ marginBottom: "0.5em" }}>Display name</h2>
						<UpdateDisplayNameForm name={userData.name} uid={userData.uid} refresh={fetchUserData} />
					</div>
					<div className={classes.accountPageCard}>
						<div className={classes.courseTypeControl}>
							<h2>{showingEnrolled ? "Enrolled courses" : "Join a new course"}</h2>
							{showingEnrolled ? (
								<a onClick={joinClickedHandler} className={classes.courseToggleLink}>
									join a new course
								</a>
							) : (
								<a onClick={enrolledClickedHandler} className={classes.courseToggleLink}>
									show my enrolled courses
								</a>
							)}
						</div>
						{/* <h2 style={{ marginBottom: "0.5em" }}>
							{showingEnrolled ? "Enrolled courses" : "Join a new course"}{" "}
							{showingEnrolled ? (
								<a onClick={joinClickedHandler} className={classes.courseToggleLink}>
									join a new course
								</a>
							) : (
								<a onClick={enrolledClickedHandler} className={classes.courseToggleLink}>
									show my enrolled courses
								</a>
							)}
						</h2> */}
						{showingEnrolled ? (
							<EnrolledCoursesList
								enrolledCids={userData.courses}
								uniCourses={universityCourses}
								refresh={changeNumEnrolled}
							/>
						) : (
							<JoinCoursePage
								enrolledCids={userData.courses}
								uniCourses={universityCourses}
								refresh={changeNumEnrolled}
							/>
						)}
					</div>
					<p>{`All time study sessions: ${userData.groups.length}`}</p>
				</div>
			)}
		</div>
	);
}
