import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { getFirestore, query, getDocs, collection, where, setDoc, doc } from "firebase/firestore";
import { getUniversityFromEmail } from "./helper";
import firebaseConfig from "./firebaseConfig";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
// googleProvider.setCustomParameters({
// 	hd: 'umich.edu'
// });

const signInWithGoogle = async () => {
	try {
		const res = await signInWithPopup(auth, googleProvider);
		const user = res.user;
		const q = query(collection(db, "users"), where("uid", "==", user.uid));
		const docs = await getDocs(q);
		const university = getUniversityFromEmail(user.email);
		if (docs.docs.length === 0) {
			await setDoc(doc(db, "users", user.uid), {
				uid: user.uid,
				name: user.displayName.split(" ")[0],
				authProvider: "google",
				email: user.email,
				university: university,
				courses: [],
				groups: []
			});
			const uniQ = query(collection(db, "universities"), where("__name__", "==", university));
			const unis = await getDocs(uniQ);
			if (unis.docs.length === 0) {
				// create uni doc
				await setDoc(doc(db, "universities", university), {
					name: university,
					courses: [],
				});
			}
			window.location.pathname = "/account";
		} else {
			window.location.pathname = "/sessions";
		}
	} catch (err) {
		console.error(err);
		alert(err.message);
	}
};

export { auth, db, signInWithGoogle };