import api from "./axios";

const baseUrl = "/distributors";

export const getDistributors = () =>
  api.get(baseUrl);

export const getInactiveDistributors = () =>
  api.get(`${baseUrl}/inactive`);

export const createDistributor = (data) =>
  api.post(baseUrl, data);

export const updateDistributor = (id, data) =>
  api.put(`${baseUrl}/${id}`, data);

export const deactivateDistributor = (id) =>
  api.delete(`${baseUrl}/${id}`);

export const activateDistributor = (id) =>
  api.put(`${baseUrl}/${id}/activate`);

export const getDistributorLookup = () =>
  api.get(`${baseUrl}/lookup`);
