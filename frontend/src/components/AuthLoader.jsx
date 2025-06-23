import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "../store/slices/authSlice";
import { authService } from "../services/authService";

export default function AuthLoader({ children }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .refreshToken()
      .then(({ user }) => {
        dispatch(setUser(user));
      })
      .catch(() => {
        dispatch(clearUser());
      })
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) {
    // use a spinner or skeleton here
    return <div>Loading....</div>;
  }
  return children;
}
