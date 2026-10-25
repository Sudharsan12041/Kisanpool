// All backend calls go through this file.
// The server address comes from the VITE_API_URL setting. When it is not set
// (normal local development) we use the backend running on this computer.
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Turn the server's error reply into one readable sentence.
// FastAPI sends { detail: "text" } for our own errors, and
// { detail: [{ loc, msg }] } when the data format is wrong (HTTP 422).
function errorMessage(data) {
  if (!data || !data.detail) return null;
  if (typeof data.detail === "string") return data.detail;
  const first = data.detail[0];
  return first ? `${first.loc[first.loc.length - 1]}: ${first.msg}` : null;
}

// One helper makes every request, so error handling lives in one place.
async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, options);
  } catch {
    // fetch itself failed: server not running, no internet, or blocked
    throw new Error("Cannot reach the server. Check your connection.");
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(errorMessage(data) || `Request failed (${response.status})`);
  }
  return data;
}

// Same as request, but sends a JSON body with a POST
function post(path, body) {
  return request(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ---------- Real backend calls ----------

export async function getLots() {
  return request("/lots");
}

export async function createListing(data) {
  // The form gives quantityKg as text; the backend wants a number
  return post("/listings", { ...data, quantityKg: Number(data.quantityKg) });
}

export async function placeOrder(lotId) {
  return post("/orders", { lotId });
}

export async function confirmDelivery(orderId, otp) {
  return post(`/orders/${encodeURIComponent(orderId)}/confirm`, { otp });
}

export async function getOrderStatus(orderId) {
  return request(`/orders/${encodeURIComponent(orderId)}`);
}

// ---------- Still mock: these belong to Members 3 and 4 ----------
// Replace the bodies with request()/post() calls once their endpoints exist.

const delay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), 300));

export async function gradePhoto(file) {
  void file;
  return delay({ grade: "A", confidence: 0.91 }); // Member 3: POST /grade
}

export async function getPriceRange(crop) {
  void crop;
  return delay({ min: 20, max: 24 }); // Member 4: GET /price?crop=...
}