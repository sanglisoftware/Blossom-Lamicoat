// src/config.ts
// export const BASE_URL = "http://localhost:5001";
export const BASE_URL = import.meta.env.MODE === 'development' ? "http://localhost:5001" : '';
//export const BASE_URL = "https://chitaledairy.sanglisoftware.com";
