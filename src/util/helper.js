import { Timestamp } from "firebase/firestore";

export function getUniversityFromEmail(email) {
	const domains = email.split("@")[1].split(".");
	return domains[domains.length - 2];
}

// date & time realted functions

// in: a Firestore Timestamp object it {seconds, nanoseconds}
// out: true if the date has not yet passed and false otherwise
export function isDateNotPassed(timestamp) {
	const currentDate = new Date();
	const firestoreDate = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);

	return firestoreDate > currentDate;
}

// in: an interger number <days>
// out: a datestring "yyyy-mm-dd" representing the date <days> days from today
export function getDateAfterDays(days) {
	const currentDate = new Date();
	currentDate.setDate(currentDate.getDate() + days);

	const year = currentDate.getFullYear();
	const month = String(currentDate.getMonth() + 1).padStart(2, "0");
	const day = String(currentDate.getDate()).padStart(2, "0");

	const formattedDate = `${year}-${month}-${day}`;
	return formattedDate;
}

// in: a datestring <date> "yyyy-mm-dd" and an integer <n>
// out: true if the date represented by <date> is within <n> days and false otherwise
export function isWithinNDays(dateString, n) {
	const currentDate = new Date();
	currentDate.setHours(0, 0, 0, 0);

	var selectedDate = dateString; // Replace with the actual date string
	var parts = selectedDate.split("-");
	var year = parseInt(parts[0], 10);
	var month = parseInt(parts[1], 10) - 1; // Months are zero-indexed
	var day = parseInt(parts[2], 10);
	var userDate = new Date(year, month, day);
	userDate.setHours(0, 0, 0, 0); // Set time to midnight

	const differenceInDays = Math.floor((userDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24));

	return differenceInDays >= 0 && differenceInDays <= n;
}

// in: nothing
// out: a timestring "hh-mm" represting the user's current time
export function getCurrentTime() {
	const now = new Date();
	const hours = String(now.getHours()).padStart(2, "0");
	const minutes = String(now.getMinutes()).padStart(2, "0");
	const currentTime = `${hours}:${minutes}`;
	return currentTime;
}

// in: a timestring <time> "hh-mm" and an integer number of minutes <minutes>
// out: a timestring "hh-mm" representing a new time <minutes> after <time>
export function addMinutesToTime(timeString, minutes) {
	const [hours, minutesInput] = timeString.split(":");

	// Parse hours and minutes as integers
	const hoursInt = parseInt(hours, 10);
	const minutesInt = parseInt(minutesInput, 10);

	// Calculate the total minutes
	const totalMinutes = hoursInt * 60 + minutesInt + minutes;

	// Calculate the new hours and minutes
	const newHours = Math.floor(totalMinutes / 60);
	const newMinutes = totalMinutes % 60;

	// Format the new time string
	const formattedHours = String(newHours).padStart(2, "0");
	const formattedMinutes = String(newMinutes).padStart(2, "0");
	const newTimeString = `${formattedHours}:${formattedMinutes}`;

	return newTimeString;
}

// in: two timestrings <t1>, <t2> "hh-mm"
// out: an integer representing the number of minutes that <t2> is ahead of <t1> by
export function calculateMinutesBetween(t1, t2) {
	const [hours1, minutes1] = t1.split(":").map(Number);
	const [hours2, minutes2] = t2.split(":").map(Number);

	// Convert both times to minutes
	const time1Minutes = hours1 * 60 + minutes1;
	const time2Minutes = hours2 * 60 + minutes2;

	// Calculate the difference in minutes
	let differenceMinutes = time2Minutes - time1Minutes;

	if (differenceMinutes < 0) {
		differenceMinutes += 24 * 60; // Add 24 hours in minutes
	}
	return differenceMinutes;
}

// in: two timestrings <t1>, <t2> "hh-mm"
// out: a new timestring in the form of <hours>h<minutes> representing the duration
// of time for a time interval [t1, t2]
export function calculateTimeDifference(t1, t2) {
	const differenceMinutes = calculateMinutesBetween(t1, t2);
	// Calculate the hours and minutes
	const hours = Math.floor(differenceMinutes / 60);
	const minutes = differenceMinutes % 60;

	// Format the result
	let formattedResult = ``;
	if (minutes === 0) {
		formattedResult = `${hours}h`;
	} else {
		formattedResult = `${hours}h${minutes}`;
	}
	// formattedResult = `${hours}h${minutes}`;
	return formattedResult;
}

// in: a datestring <date> in the form of "yyyy-mm-dd" and a timestring in the form "hh:mm"
// out: a new Firestore Timestamp object representing the combindation of <date> and <time>
export function createFirestoreTimestamp(dateString, timeString) {
	const [year, month, day] = dateString.split("-");
	const [hours, minutes] = timeString.split(":");

	const date = new Date(year, month - 1, day, hours, minutes);
	const seconds = Math.floor(date.getTime() / 1000); // Convert milliseconds to seconds
	const nanoseconds = (date.getTime() % 1000) * 1e6; // Convert remaining milliseconds to nanoseconds

	return new Timestamp(seconds, nanoseconds);
}

// in: an interger number of seconds <seconds> representing a time in epoch time
// out: a timestring in the form "hh:mm" representing the time portion of <seconds>
export function convertSecondsToTimeString(seconds) {
	const date = new Date(seconds * 1000); // Convert seconds to milliseconds
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

// in: an interger number of seconds <seconds> representing a time in epoch time
// out: a datestring in the form "yyyy-mm-dd" representing the date portion of <seconds>
export function convertSecondsToDateString(seconds) {
	const date = new Date(seconds * 1000); // Convert seconds to milliseconds
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is zero-based
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function formatTime(date) {
	let hours = date.getHours();
	const minutes = date.getMinutes().toString().padStart(2, "0");
	const period = hours >= 12 ? "PM" : "AM";

	hours = hours % 12 || 12;

	return `${hours}:${minutes} ${period}`;
}

function formatTimeRange(start, end) {
	const startTime = formatTime(start);
	const endTime = formatTime(end);
	return `from ${startTime} to ${endTime}`;
}

export function formatTimestamps(start, end) {
	const startDate = start.toDate();
	const endDate = end.toDate();

	const options = {
		year: "numeric",
		month: "long",
		day: "numeric",
	};

	const startFormatted = startDate.toLocaleDateString(undefined, options);
	const endFormatted = endDate.toLocaleDateString(undefined, options);

	if (startDate.toDateString() === endDate.toDateString()) {
		const timeRange = formatTimeRange(startDate, endDate);
		return `${startFormatted} ${timeRange}`;
	} else {
		const startTime = formatTime(startDate);
		const endTime = formatTime(endDate);
		return `${startFormatted} at ${startTime} to ${endFormatted} at ${endTime}`;
	}
}

export function generateGoogleCalendarLink(title, description, startDate, endDate) {
	// Format start and end dates in the required format (YYYYMMDDTHHMMSSZ)
	const start = startDate.toDate().toISOString().replace(/[-:]/g, "").slice(0, -5) + "Z";
	const end = endDate.toDate().toISOString().replace(/[-:]/g, "").slice(0, -5) + "Z";

	// Encode event details for the URL
	const encodedTitle = encodeURIComponent(title);
	const encodedDescription = encodeURIComponent(description);

	// Generate the Google Calendar URL
	const url = `https://www.google.com/calendar/event?action=TEMPLATE&text=${encodedTitle}&dates=${start}/${end}&details=${encodedDescription}`;

	return url;
}


export function compareStartDates(a, b) {
	if (a.start.seconds < b.start.seconds) {
		return -1;
	} else if (a.start.seconds > b.start.seconds) {
		return 1;
	} else {
		if (a.start.nanoseconds < b.start.nanoseconds) {
			return -1;
		} else if (a.start.nanoseconds > b.start.nanoseconds) {
			return 1;
		} else {
			return 0;
		}
	}
}
