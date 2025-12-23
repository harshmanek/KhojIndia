import { useState, useEffect } from "react";
import { getAllExperiences } from "../services/experienceService";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import ExperienceFilters from "../components/ExperienceFilters";
import ExperienceCard from "../components/ExperienceCard";
const Experiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExperiences = async () => {
      setLoading(true);
      try {
        const data = await getAllExperiences();
        setExperiences(data);
      } catch (error) {
        console.error("Error in fetching experiences", error);
      }
      setLoading(false);
    };
    fetchExperiences();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Explore Experiences
      </Typography>
      <ExperienceFilters />
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : experiences.length === 0 ? (
        <Typography>No experiences Found.</Typography>
      ) : (
        <Grid container spacing={3}>
          {experiences.map((exp) => (
            <Grid item xs={12} sm={6} md={4} key={exp.id}>
              <ExperienceCard experience={exp} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default Experiences;