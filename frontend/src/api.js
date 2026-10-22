// All backend calls go through this file. Mock data for now; replace function bodies with fetch() calls once the backend is ready.

// Resolve mock data after a short delay to imitate a network request.
const delay = (data) =>
  new Promise((resolve) => setTimeout(() => resolve(data), 300));

export async function getLots() {
  return delay([
    {
      id: 1,
      crop: "Tomato",
      totalKg: 1650,
      farmers: 12,
      village: "Nandi",
      thresholdKg: 2000,
      priceMin: 18,
      priceMax: 22,
    },
    {
      id: 2,
      crop: "Onion",
      totalKg: 2400,
      farmers: 18,
      village: "Pochampally",
      thresholdKg: 2000,
      priceMin: 20,
      priceMax: 25,
    },
    {
      id: 3,
      crop: "Green chilli",
      totalKg: 1280,
      farmers: 9,
      village: "Alangudi",
      thresholdKg: 2000,
      priceMin: 30,
      priceMax: 36,
    },
  ]);
}

export async function createListing(data) {
  void data;
  return delay({ success: true, lotId: 1 });
}

export async function placeOrder(lotId) {
  void lotId;
  return delay({ orderId: 101, status: "ESCROW_HELD" });
}

export async function confirmDelivery(orderId, otp) {
  void orderId;
  void otp;
  return delay({ status: "DELIVERED" });
}

export async function getOrderStatus(orderId) {
  return delay({ orderId, status: "ESCROW_HELD" });
}

export async function gradePhoto(file) {
  void file;
  return delay({ grade: "A", confidence: 0.91 });
}

export async function getPriceRange(crop) {
  void crop;
  return delay({ min: 20, max: 24 });
}
