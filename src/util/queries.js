import { db } from "./firebase";
import { query, getDocs, collection, where, getDoc, doc, updateDoc, arrayUnion, arrayRemove, addDoc, increment, deleteDoc } from "firebase/firestore";
import { isDateNotPassed, compareStartDates } from "./helper";

// given the uid, return the user object
export async function getUserData(uid) {
	// const q = query(collection(db, "users"), where("uid", "==", uid));
	// const snapshot = await getDocs(q);
	// return snapshot.docs[0].data();
	const userRef = doc(db, "users", uid);
	const userSnap = await getDoc(userRef);
	const userData = userSnap.data();
	return userData;
}

export async function getListOfUsers(uids) {
	let users = [];
	for (const uid of uids) {
		const { name, email } = await getUserData(uid);
		users.push({
			name,
			email,
		});
	}
	return users;
}

export async function getCourseData(cid) {
	const courseRef = doc(db, "courses", cid);
	const courseSnap = await getDoc(courseRef);
	const courseData = courseSnap.data();
	return courseData;
}

export async function getCoursesFromList(cids) {
	if (cids.length === 0) {
		return [];
	}
	const q = query(collection(db, "courses"), where("__name__", "in", cids));
	const snapshot = await getDocs(q);
	let courses = [];
	snapshot.forEach((course) => {
		const courseData = course.data();
		courses.push({
			cid: course.id,
			name: courseData.name,
		});
	});
	return courses;
}

// takes in email of user, returns list of courses at that university
export async function getUniversityCourses(uid) {
	const { university } = await getUserData(uid);

	const docRef = doc(db, "universities", university);
	const docSnap = await getDoc(docRef);
	const data = docSnap.data();
	const cids = data.courses; // cids = array of cids
	// console.log(cids);
	if (cids.length !== 0) {
		const q = query(collection(db, "courses"), where("__name__", "in", cids));
		const coursesSnapshot = await getDocs(q);
		let courses = [];
		coursesSnapshot.forEach((course) => {
			courses.push({
				cid: course.id,
				...course.data(),
			});
		});
		// console.log(courses);
		return courses;
	}
	return [];
}

// creates a new course document in courses collection
// then, adds id of new course to university doc courses array
export async function createCourse(courseName, uid, email) {
	const courseRef = await addDoc(collection(db, "courses"), {
		name: courseName,
		numEnrolled: 0,
		createdBy: email,
		groups: [],
	});

	const { university: universityName } = await getUserData(uid);
	const docRef = doc(db, "universities", universityName);
	await updateDoc(docRef, {
		courses: arrayUnion(courseRef.id),
	});
	return courseRef.id;
}

// add cid to user's courses array
// increment courses.numEnrolled
export async function joinCourse(uid, cid) {
	const userRef = doc(db, "users", uid);
	await updateDoc(userRef, {
		courses: arrayUnion(cid),
	});

	const courseRef = doc(db, "courses", cid);
	await updateDoc(courseRef, {
		numEnrolled: increment(1),
	});
}

// remove cid from user courses list
// decrement course.numEnrolled
export async function dropCourse(uid, cid) {
	const userRef = doc(db, "users", uid);
	await updateDoc(userRef, {
		courses: arrayRemove(cid),
	});

	const courseRef = doc(db, "courses", cid);
	await updateDoc(courseRef, {
		numEnrolled: increment(-1),
	});

	// in addition to dropping the course, all study groups
	// belonging to that course that the user is in must be dropped
	const { groups: userGroups } = await getUserData(uid);
	const { groups: courseGroups } = await getCourseData(cid);
	if (userGroups.length === 0 || courseGroups.length === 0) {
		return;
	}
	const intersection = userGroups.filter((gid) => {
		return courseGroups.includes(gid);
	});
	intersection.forEach((gid) => {
		dropGroup(uid, gid, cid);
	});
}

// returns array of enrolled courses
// {cid, name}
export async function getEnrolledCourses(uid) {
	const { courses: enrolledCids } = await getUserData(uid);

	const q = query(collection(db, "courses"), where("__name__", "in", enrolledCids));
	const coursesSnapshot = await getDocs(q);
	let courses = [];
	coursesSnapshot.forEach((course) => {
		const courseData = course.data();
		courses.push({
			cid: course.id,
			name: courseData.name,
		});
	});
	return courses;
}

export async function getGroup(gid) {
	const groupRef = doc(db, "groups", gid);
	const groupData = await getDoc(groupRef);
	return groupData.data();
}

export async function createGroup(uid, cid, groupData) {
	const groupRef = await addDoc(collection(db, "groups"), {
		description: groupData.description,
		start: groupData.start,
		end: groupData.end,
		cid: cid,
		courseName: groupData.courseName,
		attendees: [uid],
	});

	const courseRef = doc(db, "courses", cid);
	await updateDoc(courseRef, {
		groups: arrayUnion(groupRef.id),
	});
	const userRef = doc(db, "users", uid);
	await updateDoc(userRef, {
		groups: arrayUnion(groupRef.id),
	});

	return groupRef.id;
}

export async function joinGroup(uid, gid) {
	// this is storing more data than needed
	// it is an "unnessesary" crossreference.
	// however, it will save time when either showing
	// groups that a user is attending
	// or users that are attending a group.
	// the sacrifice of storage for a query time reduction
	// is worth it.
	const userRef = doc(db, "users", uid);
	await updateDoc(userRef, {
		groups: arrayUnion(gid),
	});
	const groupRef = doc(db, "groups", gid);
	await updateDoc(groupRef, {
		attendees: arrayUnion(uid),
	});
}

// cid is only needed if the group happens to also
// get deleted
export async function dropGroup(uid, gid, cid) {
	// if the attendes array for the group has one member, we
	// should delete the group
	const groupRef = doc(db, "groups", gid);
	const groupSnap = await getDoc(groupRef);
	const groupData = groupSnap.data();
	const groupAttendees = groupData.attendees;
	if (groupAttendees.length === 1) {
		// delete the group
		await deleteGroup(gid, cid);
	} else {
		// remove the attendee from the group
		await updateDoc(groupRef, {
			attendees: arrayRemove(uid),
		});
	}
	// regardless of whether or not I delete or leave the group
	// I must remove the gid from my list of groups
	const userRef = doc(db, "users", uid);
	await updateDoc(userRef, {
		groups: arrayRemove(gid),
	});
}

// this function will only be called from dropGroup,
// since the only way that a group can be deleted
// if from the last attendee leaving
export async function deleteGroup(gid, cid) {
	// const courseRef = doc(db, "courses", cid);
	// await updateDoc(courseRef, {
	// 	groups: arrayRemove(gid),
	// });
	const groupRef = doc(db, "groups", gid);
	await deleteDoc(groupRef);
}

export async function updateGroupInformation(gid, start, end, description) {
	// console.log(start, end);
	const groupRef = doc(db, "groups", gid);
	await updateDoc(groupRef, {
		start: start,
		end: end,
		description: description,
	});
}

export async function updateGroupDescription(gid, description) {
	const groupRef = doc(db, "groups", gid);
	await updateDoc(groupRef, {
		description: description,
	});
}

// returns a list of upcomming study groups
// for the courses that the user with uid is
// enrolled in
export async function getGroupFeed(uid) {
	const { courses: userCourses } = await getUserData(uid);
	var allGids = [];

	for (const cid of userCourses) {
		const courseRef = doc(db, "courses", cid);
		const courseSnap = await getDoc(courseRef);
		const { groups } = courseSnap.data();
		if (groups !== undefined && groups.length > 0) {
			allGids = allGids.concat(groups);
		}
	}
	// now, we have the gids of all upcoming groups of relevance
	if (allGids.length === 0) {
		return [];
	}
	const q = query(collection(db, "groups"), where("__name__", "in", allGids));
	const groupsSnapshot = await getDocs(q);
	let feed = [];
	groupsSnapshot.forEach((group) => {
		const groupData = group.data();
		if (isDateNotPassed(groupData.end)) {
			feed.push({
				...groupData,
				gid: group.id,
			});
		}
	});
	feed.sort(compareStartDates);
	return feed;
}
