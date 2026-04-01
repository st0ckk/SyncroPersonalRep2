import api from "./axios";

export const getMyProfile = () => api.get("/account/me");