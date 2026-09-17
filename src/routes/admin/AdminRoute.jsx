/* eslint-disable react-refresh/only-export-components */
// eslint-disable-next-line no-unused-vars
import React, { Suspense } from "react";
import { QueryClient } from "@tanstack/react-query";
import { loader as modelLoader } from "../../pages/AllModels";
import { loader as userLoader } from "../../pages/AllUsers";
import { loader as dashboardLoader } from "../../pages/DashBoard";
import { loader as singleModelLoader } from "../../pages/SingleModel";
import { LocationLoader } from "../../pages/Location";
import { ReportLoader } from "../../pages/Report";
import { singleUserLoader } from "../../pages/EditUser";
import { modelTrashLoader } from "../../pages/Trash";
import Loadable from "../../components/Loadable";

const AddModel = Loadable(React.lazy(() => import("../../pages/AddModel")));
const AddUser = Loadable(React.lazy(() => import("../../pages/AddUser")));
const AllModels = Loadable(React.lazy(() => import("../../pages/AllModels")));
const AllUsers = Loadable(React.lazy(() => import("../../pages/AllUsers")));
const DashBoard = Loadable(React.lazy(() => import("../../pages/DashBoard")));
const DashboardNew = Loadable(
	React.lazy(() => import("../../pages/new/DashboardNew"))
);
const Location = Loadable(React.lazy(() => import("../../pages/Location")));
const Report = Loadable(React.lazy(() => import("../../pages/Report")));
const EditModel = Loadable(React.lazy(() => import("../../pages/EditModel")));
const AddModelSample = Loadable(
	React.lazy(() => import("../../pages/AddModelSample"))
);
const FeatureForm = Loadable(
	React.lazy(() => import("../../pages/FeatureForm"))
);
const ViewEvidences = Loadable(
	React.lazy(() => import("../../pages/ViewEvidences"))
);
const ErrorElement = Loadable(
	React.lazy(() => import("../../components/ErrorElement"))
);
const EditUser = Loadable(React.lazy(() => import("../../pages/EditUser")));
const Trash = Loadable(React.lazy(() => import("../../pages/Trash")));
const UserProfile = Loadable(
	React.lazy(() => import("../../pages/UserProfile"))
);
const GranularTaggingList = Loadable(
	React.lazy(() => import("../../pages/GranularTaggingList"))
);
const ViewSafety = Loadable(React.lazy(() => import("../../pages/ViewSafety")));
const ViewIncidences = Loadable(
	React.lazy(() => import("../../pages/ViewIncidences"))
);
const Feedback = Loadable(React.lazy(() => import("../../pages/Feedback")));

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 60 * 1,
		},
	},
});

const adminRoutes = [
	{
		index: true,
		element: <DashboardNew />,
		// loader: dashboardLoader(queryClient),
		errorElement: <ErrorElement />,
	},
	{
		path: "models",
		element: <AllModels />,
		loader: modelLoader(queryClient),
		errorElement: <ErrorElement />,
	},
	{
		path: "location",
		element: <Location />,
		loader: LocationLoader(queryClient),
		errorElement: <ErrorElement />,
	},
	{
		path: "form-features",
		element: <FeatureForm />,
		// loader: SampleLoader(queryClient),
		errorElement: <ErrorElement />,
	},
	{
		path: "models/add-model",
		element: <AddModel />,
		errorElement: <ErrorElement />,
	},
	{
		path: "models/add-sample-model",
		element: <AddModelSample />,
		errorElement: <ErrorElement />,
		loader: singleModelLoader(queryClient),
	},
	{
		path: "users",
		element: <AllUsers />,
		loader: userLoader(queryClient),
		errorElement: <ErrorElement />,
	},
	{
		path: "users/add-user",
		element: <AddUser />,
		errorElement: <ErrorElement />,
	},
	{
		path: "edit-model/:id",
		element: <EditModel />,
		errorElement: <ErrorElement />,
		loader: singleModelLoader(queryClient),
	},
	{
		path: "edit-user/:id",
		element: <EditUser />,
		errorElement: <ErrorElement />,
		loader: singleUserLoader(queryClient),
	},
	{
		path: "single-user/:id",
		element: <UserProfile />,
		errorElement: <ErrorElement />,
		loader: singleUserLoader(queryClient),
	},
	{
		path: "report",
		element: <Report />,
		loader: ReportLoader(),
		errorElement: <ErrorElement />,
	},
	{
		path: "feedback",
		element: <Feedback />,
		errorElement: <ErrorElement />,
	},
	{
		path: "trash",
		element: <Trash />,
		loader: modelTrashLoader(queryClient),
		errorElement: <ErrorElement />,
	},
	{
		path: "granular-tagging-list/:id",
		element: <GranularTaggingList />,
		loader: singleModelLoader(),
		errorElement: <ErrorElement />,
	},
	{
		path: "view-evidences/:id",
		element: <ViewEvidences />,
		loader: singleModelLoader(),
		errorElement: <ErrorElement />,
	},
	{
		path: "view-incidents/:id",
		element: <ViewIncidences />,
		loader: singleModelLoader(),
		errorElement: <ErrorElement />,
	},
	{
		path: "view-safety/:id",
		element: <ViewSafety />,
		loader: singleModelLoader(),
		errorElement: <ErrorElement />,
	},
];

export default adminRoutes;
