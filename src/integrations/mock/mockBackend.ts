type MockUser = {
  id: string;
  email: string;
};

type MockSession = {
  user: MockUser;
};

type UserRecord = {
  id: string;
  email: string;
  password: string; // Local dev only (not secure).
  full_name: string;
};

type RoleRecord = {
  user_id: string;
  role: "rider" | "driver" | "admin";
};

type VehicleRecord = {
  user_id: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_number: string;
};

export type RideRecord = {
  id: string;
  rider_id: string;
  driver_id: string | null;
  pickup_location: string;
  destination: string;
  distance_km: number;
  base_fare: number;
  time_multiplier: number;
  weather_multiplier: number;
  final_fare: number;
  weather_condition: string;
  otp_code: string;
  status: "requested" | "accepted" | "ongoing" | "completed" | "cancelled";
  rating?: number;
  created_at: string;
};

type PricingConfig = {
  id: string;
  base_fare: number;
  rate_per_km: number;
  night_multiplier: number;
  evening_multiplier: number;
  rain_multiplier: number;
  storm_multiplier: number;
};

const STORAGE_KEY = "rr_mock_backend_v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function getState() {
  return safeParse<{
    users: Record<string, UserRecord>;
    user_roles: Record<string, RoleRecord>;
    vehicles: Record<string, VehicleRecord>;
    rides: Record<string, RideRecord>;
    pricing_config: PricingConfig;
    session: { user_id: string } | null;
  }>(localStorage.getItem(STORAGE_KEY), {
    users: {},
    user_roles: {},
    vehicles: {},
    rides: {},
    pricing_config: {
      id: "1",
      base_fare: 30,
      rate_per_km: 12,
      night_multiplier: 2,
      evening_multiplier: 1.2,
      rain_multiplier: 1.3,
      storm_multiplier: 1.5,
    },
    session: null,
  });
}

function setState(next: ReturnType<typeof getState>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  // Trigger listeners (same-tab) so rider/driver dashboards can refresh.
  try {
    window.dispatchEvent(new Event("rr_mock_backend_updated"));
  } catch {
    // Ignore if window is not available.
  }
}

function newId(prefix: string) {
  const g = globalThis as any;
  const uuid = typeof g.crypto?.randomUUID === "function" ? g.crypto.randomUUID() : `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  return `${prefix}_${uuid}`;
}

function nowIso() {
  return new Date().toISOString();
}

function userFromRecord(user: UserRecord): MockUser {
  return { id: user.id, email: user.email };
}

function getRoleForUserId(state: ReturnType<typeof getState>, userId: string): "rider" | "driver" | "admin" | null {
  return state.user_roles[userId]?.role ?? null;
}

export const mockBackend = {
  async authGetSession(): Promise<{ data: { session: MockSession | null } }> {
    const state = getState();
    if (!state.session) return { data: { session: null } };
    const user = state.users[state.session.user_id];
    if (!user) return { data: { session: null } };
    return { data: { session: { user: userFromRecord(user) } } };
  },

  async authSignOut(): Promise<void> {
    const state = getState();
    state.session = null;
    setState(state);
  },

  async authSignUp(params: {
    email: string;
    password: string;
    fullName: string;
    role: "rider" | "driver" | "admin";
    vehicleDetails?: { vehicle_type: string; vehicle_model: string; vehicle_number: string };
  }): Promise<{ data: { user: MockUser } }> {
    const state = getState();
    const existing = Object.values(state.users).find((u) => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      throw new Error("User already registered");
    }

    const userId = newId("user");
    state.users[userId] = {
      id: userId,
      email: params.email,
      password: params.password,
      full_name: params.fullName,
    };
    state.user_roles[userId] = { user_id: userId, role: params.role };

    if (params.role === "driver" && params.vehicleDetails) {
      state.vehicles[userId] = { user_id: userId, ...params.vehicleDetails };
    }

    state.session = { user_id: userId };
    setState(state);

    return { data: { user: { id: userId, email: params.email } } };
  },

  async authSignInWithPassword(params: { email: string; password: string }): Promise<{ data: { user: MockUser } }> {
    const state = getState();
    const user = Object.values(state.users).find((u) => u.email.toLowerCase() === params.email.toLowerCase());
    if (!user || user.password !== params.password) {
      throw new Error("Invalid login");
    }

    state.session = { user_id: user.id };
    setState(state);

    return { data: { user: userFromRecord(user) } };
  },

  async getRole(userId: string): Promise<{ data: { role: string | null } }> {
    const state = getState();
    return { data: { role: getRoleForUserId(state, userId) } };
  },

  async getRidesByRider(riderId: string): Promise<{ data: RideRecord[] }> {
    const state = getState();
    const rides = Object.values(state.rides)
      .filter((r) => r.rider_id === riderId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return { data: rides };
  },

  async getRidesByDriver(driverId: string): Promise<{ data: RideRecord[] }> {
    const state = getState();
    const rides = Object.values(state.rides)
      .filter((r) => r.driver_id === driverId)
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return { data: rides };
  },

  async getRequestedRides(): Promise<{ data: RideRecord[] }> {
    const state = getState();
    const rides = Object.values(state.rides)
      .filter((r) => r.status === "requested")
      .sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return { data: rides };
  },

  async getAllRides(): Promise<{ data: RideRecord[] }> {
    const state = getState();
    const rides = Object.values(state.rides).sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
    return { data: rides };
  },

  async insertRide(ride: Omit<RideRecord, "id" | "created_at" | "driver_id">): Promise<void> {
    const state = getState();
    const id = newId("ride");
    state.rides[id] = {
      ...ride,
      id,
      driver_id: null,
      created_at: nowIso(),
    };
    setState(state);
  },

  async updateRide(rideId: string, patch: Partial<RideRecord>): Promise<void> {
    const state = getState();
    const existing = state.rides[rideId];
    if (!existing) throw new Error("Ride not found");
    state.rides[rideId] = { ...existing, ...patch };
    setState(state);
  },

  async getPricingConfig(): Promise<{ data: PricingConfig | null }> {
    const state = getState();
    return { data: state.pricing_config ?? null };
  },

  async updatePricingConfig(patch: Partial<PricingConfig>): Promise<void> {
    const state = getState();
    state.pricing_config = { ...state.pricing_config, ...patch };
    setState(state);
  },
};

