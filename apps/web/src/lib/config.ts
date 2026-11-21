// Public frontend configuration. Keep backend secrets out of this module.
export const config = {
  apiBaseUrl: (
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
  ).replace(/\/+$/, ""),
};
