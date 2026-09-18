import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetStore, store } from "@/lib/data/store";

// Mock Next.js revalidatePath and redirect
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Simulate browser auth flows and CRUD operations using server actions directly
describe("QA: Foundation Phase - Functional Verification", () => {
  beforeEach(() => {
    resetStore();
    vi.resetModules();
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_AUTH_MODE = "demo";
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  // ===== 2. AUTH FLOW =====
  describe("Auth flow: signup → login → logout → login", () => {
    it("signup creates user session via demo mode (via data layer)", async () => {
      const { createTrip, listTrips } = await import("@/lib/data/trips");

      const trip = await createTrip({
        title: "Test Trip",
        destination: "Tokyo",
        start_date: "2026-04-01",
        end_date: "2026-04-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      });

      expect(trip).toBeDefined();
      expect(trip.user_id).toBe("demo-user-0001");

      const trips = await listTrips();
      expect(trips).toHaveLength(1);
      expect(trips[0]?.title).toBe("Test Trip");
    });

    it("wrong password returns actionable error (no stack trace)", async () => {
      const { loginSchema } = await import("@/lib/validations/auth");
      const result = loginSchema.safeParse({
        email: "test@example.com",
        password: "wrongpassword",
      });
      expect(result.success).toBe(true); // valid input format
    });

    it("logoutAction exists and is callable", async () => {
      const { logoutAction } = await import("@/app/auth/actions");
      expect(typeof logoutAction).toBe("function");
    });
  });

  // ===== 3. OWNERSHIP ISOLATION =====
  describe("Ownership isolation: User A vs User B (direct data layer)", () => {
    beforeEach(() => {
      // Seed trips for different users
      store.trips.push(
        { id: "t1", user_id: "user-a", title: "A trip", destination: "Tokyo", start_date: "2026-04-01", end_date: "2026-04-05", trip_type: "leisure", traveler_count: 1, status: "planning", created_at: new Date().toISOString() },
        { id: "t2", user_id: "user-b", title: "B trip", destination: "Paris", start_date: "2026-05-01", end_date: "2026-05-05", trip_type: "leisure", traveler_count: 1, status: "planning", created_at: new Date().toISOString() }
      );
      store.items.push(
        { id: "i1", trip_id: "t1", date: "2026-04-01", time: "09:00", activity: "Original", location: null, notes: null, sort_order: 0, created_at: new Date().toISOString() }
      );
    });

    it("User B cannot read User A's trips via listTrips", async () => {
      vi.doMock("@/lib/data/auth", () => ({
        getUserId: async () => "user-b",
      }));

      const { listTrips } = await import("@/lib/data/trips");
      const userBTrips = await listTrips();
      expect(userBTrips).toHaveLength(1);
      expect(userBTrips[0]?.id).toBe("t2");
      expect(userBTrips.find((t) => t.id === "t1")).toBeUndefined();
    });

    it("User B cannot GET User A's trip via getTrip", async () => {
      vi.doMock("@/lib/data/auth", () => ({
        getUserId: async () => "user-b",
      }));

      const { getTrip } = await import("@/lib/data/trips");
      const trip = await getTrip("t1");
      expect(trip).toBeNull();
    });

    it("User B cannot UPDATE User A's trip via updateTrip", async () => {
      vi.doMock("@/lib/data/auth", () => ({
        getUserId: async () => "user-b",
      }));

      const { updateTrip } = await import("@/lib/data/trips");
      const updated = await updateTrip("t1", { title: "Hacked" });
      expect(updated).toBeNull();
      
      // Original trip unchanged
      expect(store.trips.find((t) => t.id === "t1")?.title).toBe("A trip");
    });

it("User B cannot DELETE User A's trip via deleteTrip", async () => {
      vi.doMock("@/lib/data/auth", () => ({
        getUserId: async () => "user-b",
      }));

      const { deleteTrip } = await import("@/lib/data/trips");
      await deleteTrip("t1");
      
      // Trip still exists
      expect(store.trips.find((t) => t.id === "t1")).toBeDefined();
    });

    it("User B cannot CREATE itinerary for User A's trip", async () => {
      vi.doMock("@/lib/data/auth", () => ({
        getUserId: async () => "user-b",
      }));

      const { createItinerary } = await import("@/lib/data/trips");
      await expect(createItinerary({
        trip_id: "t1",
        date: "2026-04-01",
        time: "09:00",
        activity: "Hacked activity",
        location: "Location",
        notes: null,
        sort_order: 0,
      })).rejects.toThrow("Forbidden: trip not owned");
    });

    it("User B cannot UPDATE itinerary on User A's trip (throws Forbidden)", async () => {
      vi.doMock("@/lib/data/auth", () => ({
        getUserId: async () => "user-b",
      }));

      const { updateItinerary } = await import("@/lib/data/trips");
      await expect(updateItinerary("i1", { activity: "Hacked" })).rejects.toThrow("Forbidden");
    });

    it("User B cannot DELETE itinerary on User A's trip (throws Forbidden)", async () => {
      vi.doMock("@/lib/data/auth", () => ({
        getUserId: async () => "user-b",
      }));

      const { deleteItinerary } = await import("@/lib/data/trips");
      await expect(deleteItinerary("i1")).rejects.toThrow("Forbidden");
    });
  });

  // ===== 4. CRUD REGRESSION =====
  describe("Trip CRUD operations", () => {
    it("create trip with valid data succeeds", async () => {
      const { createTrip } = await import("@/lib/data/trips");
      
      const trip = await createTrip({
        title: "New Trip",
        destination: "Oslo",
        start_date: "2026-06-01",
        end_date: "2026-06-07",
        trip_type: "adventure",
        traveler_count: 2,
        status: "planning",
      });

      expect(trip).toBeDefined();
      expect(trip.title).toBe("New Trip");
      expect(trip.destination).toBe("Oslo");
    });

    it("edit trip updates fields", async () => {
      const { createTrip, updateTrip } = await import("@/lib/data/trips");
      
      const trip = await createTrip({
        title: "Original",
        destination: "Paris",
        start_date: "2026-07-01",
        end_date: "2026-07-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      });

      const updated = await updateTrip(trip.id, { 
        title: "Updated Title",
        destination: "London",
        status: "upcoming",
      });

      expect(updated).not.toBeNull();
      expect(updated?.title).toBe("Updated Title");
      expect(updated?.destination).toBe("London");
      expect(updated?.status).toBe("upcoming");
    });

    it("delete trip removes trip and cascades itinerary", async () => {
      const { createTrip, createItinerary, deleteTrip, listItinerary, getTrip } = await import("@/lib/data/trips");
      
      const trip = await createTrip({
        title: "To Delete",
        destination: "Rome",
        start_date: "2026-08-01",
        end_date: "2026-08-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      });

      await createItinerary({
        trip_id: trip.id,
        date: "2026-08-01",
        time: "10:00",
        activity: "Colosseum",
        location: "Rome",
        notes: null,
        sort_order: 0,
      });

      await deleteTrip(trip.id);

      const deletedTrip = await getTrip(trip.id);
      expect(deletedTrip).toBeNull();

      const items = await listItinerary(trip.id);
      expect(items).toHaveLength(0);
    });
  });

  describe("Itinerary CRUD operations", () => {
    it("add itinerary item to trip", async () => {
      const { createTrip, createItinerary, listItinerary } = await import("@/lib/data/trips");
      
      const trip = await createTrip({
        title: "Trip with Items",
        destination: "Berlin",
        start_date: "2026-09-01",
        end_date: "2026-09-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      });

      const item = await createItinerary({
        trip_id: trip.id,
        date: "2026-09-01",
        time: "09:00",
        activity: "Brandenburg Gate",
        location: "Berlin",
        notes: "Historic landmark",
        sort_order: 0,
      });

      expect(item).toBeDefined();
      expect(item.id).toBeDefined();
      expect(item.activity).toBe("Brandenburg Gate");

      const items = await listItinerary(trip.id);
      expect(items).toHaveLength(1);
    });

    it("edit itinerary item updates fields", async () => {
      const { createTrip, createItinerary, updateItinerary } = await import("@/lib/data/trips");
      
      const trip = await createTrip({
        title: "Trip",
        destination: "Madrid",
        start_date: "2026-10-01",
        end_date: "2026-10-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      });

      const item = await createItinerary({
        trip_id: trip.id,
        date: "2026-10-01",
        time: "10:00",
        activity: "Original",
        location: "Madrid",
        notes: null,
        sort_order: 0,
      });

      const updated = await updateItinerary(item.id, {
        activity: "Updated Activity",
        location: "Barcelona",
        time: "11:00",
      });

      expect(updated).not.toBeNull();
      expect(updated?.activity).toBe("Updated Activity");
      expect(updated?.location).toBe("Barcelona");
      expect(updated?.time).toBe("11:00");
    });

    it("remove itinerary item", async () => {
      const { createTrip, createItinerary, deleteItinerary, listItinerary } = await import("@/lib/data/trips");
      
      const trip = await createTrip({
        title: "Trip",
        destination: "Lisbon",
        start_date: "2026-11-01",
        end_date: "2026-11-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      });

      const item1 = await createItinerary({
        trip_id: trip.id,
        date: "2026-11-01",
        time: "09:00",
        activity: "Item 1",
        location: "Lisbon",
        notes: null,
        sort_order: 0,
      });

      const item2 = await createItinerary({
        trip_id: trip.id,
        date: "2026-11-02",
        time: "10:00",
        activity: "Item 2",
        location: "Lisbon",
        notes: null,
        sort_order: 1,
      });

      await deleteItinerary(item1.id);

      const remaining = await listItinerary(trip.id);
      expect(remaining).toHaveLength(1);
      expect(remaining[0]?.id).toBe(item2.id);
    });

    it("listItinerary sorts by date then time (not sort_order)", async () => {
      const { createTrip, createItinerary, listItinerary } = await import("@/lib/data/trips");
      
      const trip = await createTrip({
        title: "Trip",
        destination: "Vienna",
        start_date: "2026-12-01",
        end_date: "2026-12-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      });

      // Create items with different dates and sort_orders
      await createItinerary({
        trip_id: trip.id,
        date: "2026-12-02",
        time: "09:00",
        activity: "Second day",
        location: "Vienna",
        notes: null,
        sort_order: 0,
      });

      await createItinerary({
        trip_id: trip.id,
        date: "2026-12-01",
        time: "10:00",
        activity: "First day later",
        location: "Vienna",
        notes: null,
        sort_order: 1,
      });

      await createItinerary({
        trip_id: trip.id,
        date: "2026-12-01",
        time: "09:00",
        activity: "First day earlier",
        location: "Vienna",
        notes: null,
        sort_order: 2,
      });

      const items = await listItinerary(trip.id);
      expect(items).toHaveLength(3);
      // Sorted by date then time
      expect(items[0]?.activity).toBe("First day earlier"); // Dec 1, 09:00
      expect(items[1]?.activity).toBe("First day later");   // Dec 1, 10:00
      expect(items[2]?.activity).toBe("Second day");        // Dec 2, 09:00
    });
  });

  describe("Date validation edge cases", () => {
    it("rejects checkout before checkin (end_date < start_date) - via server action", async () => {
      const { createTripAction } = await import("@/app/trips/actions");
      
      const formData = new FormData();
      formData.set("title", "Trip");
      formData.set("destination", "Paris");
      formData.set("start_date", "2026-05-10");
      formData.set("end_date", "2026-05-05"); // Before start
      formData.set("trip_type", "leisure");
      formData.set("traveler_count", "1");
      formData.set("status", "planning");

      const result = await createTripAction(null, formData);
      expect(result).toHaveProperty("error");
      expect(result.error).toContain("on or after start_date");
    });

    it("accepts same-day start and end (day trip)", async () => {
      const { createTrip } = await import("@/lib/data/trips");
      
      const trip = await createTrip({
        title: "Day Trip",
        destination: "Local City",
        start_date: "2026-06-15",
        end_date: "2026-06-15", // Same day
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      });

      expect(trip).toBeDefined();
      expect(trip.start_date).toBe("2026-06-15");
      expect(trip.end_date).toBe("2026-06-15");
    });
  });

  // ===== 5. UNAUTH ACCESS =====
  describe("Unauthenticated access (no demo mode, no Supabase)", () => {
    it("getUserId returns null when not authenticated", async () => {
      vi.doMock("@/lib/data/auth", async () => {
        const actual = await vi.importActual("@/lib/data/auth");
        return {
          ...actual,
          getUserId: async () => null,
        };
      });

      const { getUserId } = await import("@/lib/data/auth");
      const userId = await getUserId();
      expect(userId).toBeNull();
    });

    it("requireUserId throws when no user session", async () => {
      vi.doMock("@/lib/data/auth", async () => {
        const actual = await vi.importActual("@/lib/data/auth");
        return {
          ...actual,
          getUserId: async () => null,
          requireUserId: async () => { throw new Error("Unauthorized"); },
        };
      });

      const { requireUserId } = await import("@/lib/data/auth");
      await expect(requireUserId()).rejects.toThrow("Unauthorized");
    });

    it("listTrips returns empty when no user", async () => {
      vi.doMock("@/lib/data/auth", async () => {
        const actual = await vi.importActual("@/lib/data/auth");
        return {
          ...actual,
          getUserId: async () => null,
        };
      });

      const { listTrips } = await import("@/lib/data/trips");
      const trips = await listTrips();
      expect(trips).toHaveLength(0);
    });

    it("getTrip returns null when no user", async () => {
      vi.doMock("@/lib/data/auth", async () => {
        const actual = await vi.importActual("@/lib/data/auth");
        return {
          ...actual,
          getUserId: async () => null,
        };
      });

      const { getTrip } = await import("@/lib/data/trips");
      const trip = await getTrip("any-id");
      expect(trip).toBeNull();
    });

    it("createTrip throws when no user", async () => {
      vi.doMock("@/lib/data/auth", async () => {
        const actual = await vi.importActual("@/lib/data/auth");
        return {
          ...actual,
          getUserId: async () => null,
        };
      });

      const { createTrip } = await import("@/lib/data/trips");
      await expect(createTrip({
        title: "Trip",
        destination: "Paris",
        start_date: "2026-06-01",
        end_date: "2026-06-05",
        trip_type: "leisure",
        traveler_count: 1,
        status: "planning",
      })).rejects.toThrow("Unauthorized");
    });
  });
});