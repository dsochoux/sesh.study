import { getEnrolledCourses } from "../util/queries";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GroupForm from "../components/GroupForm";

export default function CreatePage() {
	const { currentUser } = useAuth();
	const navigate = useNavigate();
	const [enrolledCourses, setEnrolledCourses] = useState([]);
	const [isLoading, setIsLoading] = useState(true);

	async function fetchEnrolledCourses() {
		try {
			const result = await getEnrolledCourses(currentUser.uid);
			setEnrolledCourses(result);
		} catch (error) {
			throw error;
		}
		// console.log(enrolledCourses);
		setIsLoading(false);
	}

	useEffect(() => {
		if (!currentUser) {
			navigate('/');
		} else {
			fetchEnrolledCourses();
		}
	}, []);

	return (
		<div>
			<h1>New study session</h1>
			{/* {!isLoading ? <CreateGroupForm courses={enrolledCourses} /> : <p>Loading...</p>} */}
			{!isLoading ? <GroupForm courses={enrolledCourses} creating={true}/> : <p>Loading...</p>}
		</div>
	);
}
