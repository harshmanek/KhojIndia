import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { setUser } from "../store/slices/authSlice";
import {
  Alert,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import PhoneInput from "react-phone-input-2";
// import "react-phone-input-2/style.css";
const Register = () => {
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    role: "TRAVELLER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    if (
      !formData.firstname ||
      !formData.lastname ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.role
    ) {
      setError("All fields are required");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (formData.password.length < 6) {
      setError("Error must be length 6 characters long");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email id");
      return false;
    }

    const phoneRegex = /^\+\d{10,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError("Please enter a valid phone number with country code:)");
      return false;
    }

    const allowedRoles = ["TRAVELLER", "HOST", "ADMIN"];
    if (!allowedRoles.includes(formData.role)) {
      setError("Please select a valid role");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }
    try {
      const { confirmPassword, ...registrationData } = formData;

      const { user } = await authService.register(registrationData);

      // Auto-login:set user in Redux Store
      dispatch(setUser(user));

      // Navigate to the intended destination or home
      navigate(from, { replace: true });
    } catch (error) {
      setError(error.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography component="h1" variant="h5">
          Create Account
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, width: "100%" }}>
            {error}
          </Alert>
        )}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ mt: 3, width: "100%" }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                name="firstname"
                required
                fullWidth
                label="First Name"
                autoComplete="given-name"
                value={formData.firstname}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="lastname"
                required
                fullWidth
                label="Last Name"
                autoComplete="family-name"
                value={formData.lastname}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="email"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <PhoneInput
                country={"in"}
                value={formData.phone}
                onChange={(phone) =>
                  setFormData((prev) => ({ ...prev, phone: "+" + phone }))
                }
                inputProps={{
                  name: "phone",
                  required: true,
                  autoFocus: false,
                }}
                inputStyle={{ width: 100 }}
                specialLabel="Phone Number"
                placeholder="Enter phone number"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Role *"
                  onChange={handleChange}
                >
                  <MenuItem value="TRAVELLER">
                    <Box>
                      <Typography variant="body1">TRAVELLER</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Book and experience adventures
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="HOST">
                    <Box>
                      <Typography variant="body1">HOST</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Create and manage Experiences
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="ADMIN">
                    <Box>
                      <Typography variant="body1">Admin</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Manage platform and users
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="password"
                required
                fullWidth
                label="Password"
                type="password"
                auto-complete="new-password"
                value={formData.password}
                onChange={handleChange}
                helperText="Password must be at least 6 characters long"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="confirmPassword"
                required
                fullWidth
                label="Confirm Password"
                type="password"
                auto-complete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate("/login")}
            sx={{ mt: 1 }}
          >
            Alread have an account?? Sign In
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Register;
