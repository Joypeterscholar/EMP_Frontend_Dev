// eslint-disable-next-line no-unused-vars
import "./index.css";
import React, { Suspense } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import taggersRoutes from "./routes/taggers/TaggersRoute";
import adminRoutes from "./routes/admin/AdminRoute";
import reviewersRoutes from "./routes/reviewer/ReviewersRoute";
import { loader as singleModelLoader } from "./pages/SingleModel";
import { Loading } from "./components";
import SingleModel from "./pages/SingleModel";
import Loadable from "./components/Loadable";
const Login = Loadable(React.lazy(() => import("./features/auth/Login")));
const NewPassword = Loadable(React.lazy(() => import("./pages/NewPassword")));
const OtpInput = Loadable(React.lazy(() => import("./pages/OtpInput")));
const PasswordReset = Loadable(
	React.lazy(() => import("./pages/PasswordReset"))
);
const TwoFactor = Loadable(React.lazy(() => import("./pages/TwoFactor")));
const UnauthorizedPage = Loadable(
	React.lazy(() => import("./pages/UnauthorizedPage"))
);
const Error = Loadable(React.lazy(() => import("./pages/Error")));
const RootLayout = Loadable(React.lazy(() => import("./layout/RootLayout")));
const AdminLayout = Loadable(React.lazy(() => import("./layout/AdminLayout")));
const TaggersLayout = Loadable(
	React.lazy(() => import("./layout/TaggersLayout"))
);
const ReviewersLayout = Loadable(
	React.lazy(() => import("./layout/ReviewersLayout"))
);
const MainLayoutNew = Loadable(
	React.lazy(() => import("./layout/new/MainLayoutNew"))
);
const TagListCreate = Loadable(
	React.lazy(() => import("./pages/TagListCreate"))
);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 5,
		},
	},
});

const router = createBrowserRouter([
	{
		path: "",
		element: <RootLayout />,
		errorElement: <Error />,
	},
	{
		path: "/admin",
		element: <MainLayoutNew />,
		children: adminRoutes,
		errorElement: <Error />,
	},
	{
		path: "/tagger",
		element: <MainLayoutNew />,
		children: taggersRoutes,
		errorElement: <Error />,
	},
	{
		path: "/reviewer",
		element: <MainLayoutNew />,
		children: reviewersRoutes,
		errorElement: <Error />,
	},
	{
		path: "/login",
		element: <Login />,
		errorElement: <Error />,
	},
	{
		path: "/reset-password",
		element: <PasswordReset />,
		errorElement: <Error />,
	},
	{
		path: "/password-otp",
		element: <OtpInput />,
		errorElement: <Error />,
	},
	{
		path: "/new-password",
		element: <NewPassword />,
		errorElement: <Error />,
	},
	{
		path: "/unauthorized",
		element: <UnauthorizedPage />,
	},
	{
		path: "/view-model/:id",
		element: <SingleModel />,
		loader: singleModelLoader(),
		errorElement: <Error />,
	},
	{
		path: "/tag-model/:id",
		element: <SingleModel />,
		loader: singleModelLoader(),
		errorElement: <Error />,
	},
	{
		path: "/tag-list-create/:id",
		element: <TagListCreate />,
		loader: singleModelLoader(),
		errorElement: <Error />,
	},
	{
		path: "/two-factor",
		element: <TwoFactor />,
		errorElement: <Error />,
	},
]);

const App = () => {
	return (
		<Suspense fallback={<Loading />}>
			<QueryClientProvider client={queryClient}>
				<RouterProvider fallbackElement={<Loading />} router={router} />
			</QueryClientProvider>
		</Suspense>
	);
};
export default App;
