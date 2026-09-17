/* eslint-disable react/display-name */
import React from 'react';
import Loading from './Loading';

const Loadable = (Component) => (props) =>
  (
    <React.Suspense fallback={<Loading />}>
      <Component {...props} />
    </React.Suspense>
  );

export default Loadable;
