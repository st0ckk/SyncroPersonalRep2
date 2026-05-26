import api from "./axios";

export const getMyProfile = () => api.get("/account/me");

export const getTwoFactorSetup = () => api.get("/account/2fa/setup");
export const enableTwoFactor = (code) => api.post("/account/2fa/enable", { code });
export const disableTwoFactor = () => api.delete("/account/2fa/disable");
export const verifyTotp = (tempToken, code) =>
    api.post("/auth/verify-totp", { tempToken, code });
