import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { memoize } from 'proxy-memoize';

// eslint-disable-next-line react/prop-types
const ProtectedRoute = ({ children }) => {
  const user = useSelector((state) => state.userState.user);

  if (!user) {
    return <Navigate to='/login' replace />;
  }

  return children;
};

export default ProtectedRoute;
