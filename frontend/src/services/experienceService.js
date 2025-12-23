import api from "./api";

export const getAllExperiences = async () => {
  try {
    const res = await api.get("/experiences");
    return res.data;
  } catch (error) {
    console.error("Error in fetching the experiences", error);
    throw error;
  }
};
