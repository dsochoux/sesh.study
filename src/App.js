import { RouterProvider, createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/Home";
import FeedPage from "./pages/Feed";
import Root from "./pages/Root";
import AccountPage from "./pages/Account";
import CreatePage from "./pages/Create";
import Error from "./pages/Error";

const router = createBrowserRouter([
	{
		path: "/",
		element: <Root />,
		errorElement: (
			<Root>
				<Error />
			</Root>
		),
		children: [
			{ index: true, element: <HomePage /> },
			{ path: "sessions", element: <FeedPage /> },
			{ path: "account", element: <AccountPage /> },
			{ path: "create", element: <CreatePage /> },
			{ path: "demo", element: <h1>Secret demo</h1> },
		],
	},
]);

function App() {
	return <RouterProvider router={router} />;
}

export default App;
