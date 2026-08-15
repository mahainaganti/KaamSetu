const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000";


// Get all workers
export async function getWorkers() {

  const response = await fetch(
    `${API_BASE_URL}/workers`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch workers");
  }

  return await response.json();
}


// Get one worker
export async function getWorker(id: string) {

  const response = await fetch(
    `${API_BASE_URL}/workers/${id}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch worker");
  }

  return await response.json();
}


// Create worker
export async function createWorker(workerData: {
  full_name: string;
  phone: string;
  gender: string;
  preferred_language: string;
  experience_years: number;
  travel_radius_km: number;
  average_rating: number;
  verification_status: string;
  availability_status: string;
  location_id: number;
}) {

  const response = await fetch(
    `${API_BASE_URL}/workers`,
    {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(workerData),
    }
  );


  if (!response.ok) {

    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.error ||
      "Failed to create worker"
    );

  }


  return await response.json();
}


// Update worker
export async function updateWorker(
  id: string,
  workerData: {
    full_name: string;
    phone: string;
    gender: string;
    preferred_language: string;
    experience_years: number;
    travel_radius_km: number;
    average_rating: number;
    verification_status: string;
    availability_status: string;
    location_id: number;
  }
) {

  const response = await fetch(
    `${API_BASE_URL}/workers/${id}`,
    {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(workerData),
    }
  );


  if (!response.ok) {

    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.error ||
      "Failed to update worker"
    );

  }


  return await response.json();
}


// Delete worker
export async function deleteWorker(
  id: string
) {

  const response = await fetch(
    `${API_BASE_URL}/workers/${id}`,
    {
      method: "DELETE",
    }
  );


  if (!response.ok) {

    const errorData = await response.json().catch(() => ({}));

    throw new Error(
      errorData.message ||
      "Failed to delete worker"
    );

  }


  return await response.json();
}


type EmployerData = {
  full_name: string;
  phone: string;
  email: string;
  employer_type: string;
  verification_status: string;
  location_id: number;
};

export async function getEmployers() {
  const response = await fetch(`${API_BASE_URL}/employers`);
  if (!response.ok) throw new Error("Failed to fetch employers");
  return await response.json();
}

export async function getEmployer(id: string) {
  const response = await fetch(`${API_BASE_URL}/employers/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch employer");
  }
  return await response.json();
}

export async function createEmployer(employerData: EmployerData) {
  const response = await fetch(`${API_BASE_URL}/employers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employerData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to create employer");
  }
  return await response.json();
}

export async function updateEmployer(id: string, employerData: EmployerData) {
  const response = await fetch(`${API_BASE_URL}/employers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(employerData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update employer");
  }
  return await response.json();
}

export async function deleteEmployer(id: string) {
  const response = await fetch(`${API_BASE_URL}/employers/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to delete employer");
  }
  return await response.json();
}


type JobData = {
  employer_id: number;
  title: string;
  description: string;
  budget: number;
  status: string;
  location_id: number;
};

export async function getJobs() {
  const response = await fetch(`${API_BASE_URL}/jobs`);
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return await response.json();
}

export async function getJob(id: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch job");
  }
  return await response.json();
}

export async function createJob(jobData: JobData) {
  const response = await fetch(`${API_BASE_URL}/jobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to create job");
  }
  return await response.json();
}

export async function updateJob(id: string, jobData: JobData) {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(jobData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update job");
  }
  return await response.json();
}

export async function deleteJob(id: string) {
  const response = await fetch(`${API_BASE_URL}/jobs/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to delete job");
  }
  return await response.json();
}


type BookingData = {
  job_id: number;
  worker_id: number;
  scheduled_date: string;
  booking_status: string;
  final_price: number | null;
  completion_date: string | null;
};

export async function getBookings() {
  const response = await fetch(`${API_BASE_URL}/bookings`);
  if (!response.ok) throw new Error("Failed to fetch bookings");
  return await response.json();
}

export async function getBooking(id: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch booking");
  }
  return await response.json();
}

export async function createBooking(bookingData: BookingData) {
  const response = await fetch(`${API_BASE_URL}/bookings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookingData) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to create booking");
  }
  return await response.json();
}

export async function updateBooking(id: string, bookingData: BookingData) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(bookingData) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update booking");
  }
  return await response.json();
}

export async function deleteBooking(id: string) {
  const response = await fetch(`${API_BASE_URL}/bookings/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to delete booking");
  }
  return await response.json();
}


type PaymentData = {
  booking_id: number;
  amount: number;
  payment_method: string;
  payment_status: string;
  transaction_id: string;
};

export async function getPayments() {
  const response = await fetch(`${API_BASE_URL}/payments`);
  if (!response.ok) throw new Error("Failed to fetch payments");
  return await response.json();
}

export async function getPayment(id: string) {
  const response = await fetch(`${API_BASE_URL}/payments/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch payment");
  }
  return await response.json();
}

export async function createPayment(paymentData: PaymentData) {
  const response = await fetch(`${API_BASE_URL}/payments`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(paymentData) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to create payment");
  }
  return await response.json();
}

export async function updatePayment(id: string, paymentData: PaymentData) {
  const response = await fetch(`${API_BASE_URL}/payments/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(paymentData) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update payment");
  }
  return await response.json();
}

export async function deletePayment(id: string) {
  const response = await fetch(`${API_BASE_URL}/payments/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to delete payment");
  }
  return await response.json();
}


type RatingData = {
  booking_id: number;
  employer_id: number;
  worker_id: number;
  rating: number;
  review: string | null;
};

export async function getRatings() {
  const response = await fetch(`${API_BASE_URL}/ratings`);
  if (!response.ok) throw new Error("Failed to fetch ratings");
  return await response.json();
}

export async function getRating(id: string) {
  const response = await fetch(`${API_BASE_URL}/ratings/${id}`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to fetch rating");
  }
  return await response.json();
}

export async function createRating(ratingData: RatingData) {
  const response = await fetch(`${API_BASE_URL}/ratings`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ratingData) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to create rating");
  }
  return await response.json();
}

export async function updateRating(id: string, ratingData: RatingData) {
  const response = await fetch(`${API_BASE_URL}/ratings/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(ratingData) });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to update rating");
  }
  return await response.json();
}

export async function deleteRating(id: string) {
  const response = await fetch(`${API_BASE_URL}/ratings/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to delete rating");
  }
  return await response.json();
}

export type DashboardStats = {
  total_workers: number;
  available_workers: number;
  open_jobs: number;
  total_revenue: number;
  total_employers: number;
  total_bookings: number;
  pending_payments: number;
  active_disputes: number;
  total_ratings: number;
  average_rating: number;
};

export type RecentBooking = {
  booking_id: number;
  worker_name: string;
  job_title: string;
  booking_status: string;
  amount: number;
};

export type DashboardData = {
  stats: DashboardStats;
  recent_bookings: RecentBooking[];
};

export async function getDashboardStats(): Promise<DashboardData> {
  const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.message || "Failed to fetch dashboard statistics");
  }
  return await response.json();
}

