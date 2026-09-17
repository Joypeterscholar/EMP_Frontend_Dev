/* eslint-disable react-refresh/only-export-components */
// eslint-disable-next-line no-unused-vars
import React, { Suspense } from 'react';
/* eslint-disable no-unused-vars */
import { QueryClient } from '@tanstack/react-query';
import Loadable from '../../components/Loadable';
import { loader as singleModelLoader } from '../../pages/SingleModel';
import { ReportLoader } from '../../pages/Report';
import { modelloader } from '../../pages/ReviewerDashboad';
import { singleUserLoader } from '../../pages/EditUser';

// const AllModels = Loadable(React.lazy(() => import('../../pages/AllModels')));
const ViewEvidences = Loadable(React.lazy(() => import('../../pages/ViewEvidences')));
const ErrorElement = Loadable(React.lazy(() => import('../../components/ErrorElement')));
const ReviewerDashBoard = Loadable(React.lazy(() => import('../../pages/ReviewerDashboad')));
const EditUser = Loadable(React.lazy(() => import('../../pages/EditUser')));
const UserProfile = Loadable(React.lazy(() => import('../../pages/UserProfile')));
const ViewSafety = Loadable(React.lazy(() => import('../../pages/ViewSafety')));
const ViewIncidences = Loadable(React.lazy(() => import('../../pages/ViewIncidences')));
const Report = Loadable(React.lazy(() => import('../../pages/Report')));
const Feedback = Loadable(React.lazy(() => import('../../pages/Feedback')));


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
});

const reviewersRoutes = [
  {
    index: true,
    element: <ReviewerDashBoard />,
    loader: modelloader(queryClient),
    errorElement: <ErrorElement />,
  },
  {
    path: 'edit-user/:id',
    element: <EditUser />,
    errorElement: <ErrorElement />,
    loader: singleUserLoader(queryClient),
  },
  {
    path: 'single-user/:id',
    element: <UserProfile />,
    errorElement: <ErrorElement />,
    loader: singleUserLoader(queryClient),
  },
  {
    path: 'view-evidences/:id',
    element: <ViewEvidences />,
    loader: singleModelLoader(),
    errorElement: <ErrorElement />,
  },
  {
    path: 'view-incidents/:id',
    element: <ViewIncidences />,
    loader: singleModelLoader(),
    errorElement: <ErrorElement />,
  },
  {
    path: 'view-safety/:id',
    element: <ViewSafety />,
    loader: singleModelLoader(),
    errorElement: <ErrorElement />,
  },
  {
    path: 'report',
    element: <Report />,
    loader: ReportLoader(),
    errorElement: <ErrorElement />,
  },
  {
    path: 'feedback',
    element: <Feedback />,
    errorElement: <ErrorElement />, 
  },
];

export default reviewersRoutes;
