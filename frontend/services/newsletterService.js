import { apiRequest } from "./api";

export const subscribeToNewsletter = (email) =>
  apiRequest("/newsletter/subscribe", { method: "POST", body: { email } });
