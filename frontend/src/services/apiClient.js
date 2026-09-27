let token = null;
export function setToken(value) {
  token = value;
}
export async function apiClient(
  path,
  { method = "GET", body, signal, responseType = "json" } = {},
) {
  const multipart = typeof FormData !== "undefined" && body instanceof FormData;
  let response;
  try {
    response = await fetch("/api" + path, {
      method,
      headers: {
        ...(token ? { Authorization: "Bearer " + token } : {}),
        ...(!multipart && body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? (multipart ? body : JSON.stringify(body)) : undefined,
      signal: signal || AbortSignal.timeout(65000),
      cache: "no-store",
    });
  } catch (error) {
    throw new Error(
      error.name === "TimeoutError"
        ? "Request timed out. Please retry."
        : "Cannot reach the backend. Check that it is running.",
    );
  }
  if (response.ok && responseType === "blob") return response.blob();
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      response.status >= 500
        ? "Cannot reach the API. Start the backend with npm run dev:local in the backend folder, then retry. If it is already running, check BACKEND_URL in frontend/.env.local and restart the frontend."
        : "The API returned a non-JSON response. Check BACKEND_URL in frontend/.env.local and restart the frontend.",
    );
  }
  if (!response.ok || data.success === false) {
    if (response.status === 401 && token) {
      token = null;
      window.dispatchEvent(new Event("session-expired"));
    }
    throw Object.assign(new Error(data.message || "Request failed"), {
      status: response.status,
    });
  }
  return data;
}

