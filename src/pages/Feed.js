import { useState, useEffect, useReducer } from "react";
import { useAuth } from "../context/AuthContext";
import { getCoursesFromList, getUserData } from "../util/queries";
import { useLocation, useNavigate } from "react-router-dom";
import StudyGroup from "../components/StudyGroup";
import { getGroupFeed } from "../util/queries";
import FilterButton from "../components/FilterButton";
import classes from "./Feed.module.css";

function reducer(state, action) {
	switch (action.type) {
		case "SETUP":
			const res = { All: { name: "All", filterBy: (action.filter === "all" || action.filter === null) }, Attending: { name: "Attending", filterBy: action.filter === "attending" } };
			action.courses.forEach((course) => {
				res[course.cid] = {
					name: course.name,
					filterBy: action.filter === course.name,
				};
			});
			return res;
		case "FILTER":
			if (action.course === "All") {
				// set all to true and all of the others to false
				const newState = {};
				Object.keys(state).forEach((cid) => {
					if (cid === "All") {
						newState["All"] = { name: "All", filterBy: true };
					} else {
						newState[cid] = { name: state[cid].name, filterBy: false };
					}
				});
				return { ...newState };
			} else {
				const course = action.course;
				const newState = { ...state };
				let all = true;
				newState[course].filterBy = !state[course].filterBy;
				Object.keys(newState).forEach((cid) => {
					all = all && !newState[cid].filterBy;
				});
				return {
					...newState,
					All: { name: "All", filterBy: all },
				};
			}
	}
}

function FeedPage() {
	const location = useLocation();
	const searchParams = new URLSearchParams(location.search);

	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [groups, setGroups] = useState([]); // all study groups
	const [filteredGroups, setFilteredGroups] = useState([]);
	const [userGroups, setUserGroups] = useState([]); // list of gids that user is attending
	const [isLoading, setIsLoading] = useState(true); // are we loading the data currently?
	const [filterState, dispatch] = useReducer(reducer, {});

	async function fetchFeed() {
		setIsLoading(true);
		try {
			const groupFeed = await getGroupFeed(currentUser.uid);
			setGroups(groupFeed);
			setFilteredGroups(groupFeed);
			const { courses: userCourses, groups: userGroups } = await getUserData(currentUser.uid);
			setUserGroups(userGroups);
			// setUserCourses(userCourses);
			const detailedUserCourses = await getCoursesFromList(userCourses);
			dispatch({
				type: "SETUP",
				courses: detailedUserCourses,
				filter: searchParams.get("filter"),
			});
		} catch (error) {
			console.log(error);
		}
		setIsLoading(false);
	}

	function filterClickedHandler(course) {
		dispatch({
			type: "FILTER",
			course: course,
		});
	}

	useEffect(() => {
		if (!currentUser) {
			navigate("/");
		} else {
			fetchFeed();
		}
	}, []);

	useEffect(() => {
		if (groups.length <= 0) {
			return;
		}
		// iterate through groups and fill filteredGroups
		// according to the filters
		const newFilteredGroups = [];
		// if all is true, just show everything
		if (filterState["All"].filterBy) {
			setFilteredGroups([...groups]);
			return;
		}

		let allCoursesFalse = true;
		Object.keys(filterState).forEach((cid) => {
			if (cid !== "All" && cid !== "Attending") {
				allCoursesFalse = allCoursesFalse && !filterState[cid].filterBy;
			}
		});
		// if attending is true and all of the others are false,
		// show all attending
		if (allCoursesFalse && filterState["Attending"].filterBy) {
			groups.forEach((group) => {
				if (userGroups.includes(group.gid)) {
					newFilteredGroups.push(group);
				}
			});
			setFilteredGroups(newFilteredGroups);
			return;
		}
		// if attending is true and at least one of the others is
		// true, show only those that meet both criteria
		if (!allCoursesFalse && filterState["Attending"].filterBy) {
			groups.forEach((group) => {
				if (userGroups.includes(group.gid) && filterState[group.cid].filterBy) {
					newFilteredGroups.push(group);
				}
			});
			setFilteredGroups(newFilteredGroups);
			return;
		}

		groups.forEach((group) => {
			if (filterState[group.cid].filterBy) {
				newFilteredGroups.push(group);
			}
		});
		setFilteredGroups(newFilteredGroups);
		return;
	}, [filterState]);

	return (
		<>
			<div>
				<h1>Current & upcoming study sessions</h1>
				{isLoading && <p>Finding study sessions...</p>}
				{/* {!isLoading && groups.length === 0 && <p>Enroll in courses to see upcoming study groups!</p>} */}
				{!isLoading && (
					<>
						<div className={classes.filters}>
							{Object.keys(filterState).map((cid) => {
								return (
									<FilterButton
										action={filterClickedHandler.bind(null, cid)}
										key={cid}
										enabled={filterState[cid].filterBy}
									>
										{filterState[cid].name}
									</FilterButton>
								);
							})}
						</div>
						{filteredGroups.length > 0 ? (
							filteredGroups.map((group) => {
								return (
									<StudyGroup
										data={group}
										key={group.gid}
										attending={userGroups.includes(group.gid)}
										refresh={fetchFeed}
									/>
								);
							})
						) : (
							<p>
								No upcoming groups found.{" "}
								<a className={classes.makeOneLink} href="/create">
									Make one!
								</a>
							</p>
						)}
					</>
				)}
			</div>
		</>
	);
}

export default FeedPage;
