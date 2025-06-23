import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { clearUser } from "../store/slices/authSlice";
import { Button } from "@mui/material";

export default function LogoutButton() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Error loggin out", error);
      throw error;
    }
    dispatch(clearUser());
    navigate("/login");
  };
  return (
    <Button color="error" variant="outlined" onClick={handleLogout}>
      Logout
    </Button>
  );
}
