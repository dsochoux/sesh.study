import SignInWithGoogleButton from '../components/SignInWithGoogleButton';
import classes from './Home.module.css';
import { useAuth } from '../context/AuthContext';

function HomePage() {
	const {currentUser} = useAuth();
	return (
		<>
			<div className={classes.homeContentContainer}>
				<div>
					<h1>Welcome to Sesh.Study!</h1>
				</div>
				<div>
					<h2>Sesh.Study is a tool for connecting & studying with classmates you would've never met otherwise.</h2>
				</div>
				<div>
					<h3>1. Sign in with your university email</h3>
					<h3>2. Enroll in relevant courses</h3>
					<h3>3. Find or create study sessions</h3>
					<h3>4. Collaborate with peers in person</h3>
				</div>
				<div>
					{!currentUser && <SignInWithGoogleButton />}
				</div>
			</div>
		</>
	);
}

export default HomePage;
