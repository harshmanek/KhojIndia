import React from "react";
import { Card,CardContent,CardMedia,Typography,Box } from "@mui/material";

const ExperienceCard= ({experience})=>(
    <Card sx={{height:"100%",display:"flex",flexDirection:"column"}}>
        <CardMedia
        component="img"
        height="180"
        image={experience.imageUrl||"/default-experience.jpg"}
        alt={experience.title}
/>
    <CardContent>
        <Typography variant="h6">{experience.title}</Typography>
        <Typography variant="body2" color="text.secondary">{experience.location}</Typography>
        <Typography variant="body2" color="text.secondary">{new Date(experience.date).toISOString()}</Typography>
        <Typography variant="subtitle1" sx={{mt:1}}>{experience.price}</Typography>
    </CardContent>
    </Card>
)
export default ExperienceCard;