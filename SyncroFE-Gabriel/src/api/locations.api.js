import api from "./axios";

export const getProvinces = () =>
    api.get("/provinces");

export const getCantons = (provinceCode) =>
    api.get(`/cantons?province_code=${provinceCode}`);

export const getDistricts = (cantonCode) =>
    api.get(`/districts?canton_code=${cantonCode}`);
