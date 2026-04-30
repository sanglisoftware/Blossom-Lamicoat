const DEV_API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

export const BASE_URL = import.meta.env.DEV ? DEV_API_BASE_URL : "";
