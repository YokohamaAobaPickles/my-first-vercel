/**
 * Filename: src/lib/eventApi.test.ts
 * Version: V1.0.10
 * Update: 2026-02-27
 * Remarks: V1.0.10 - API/DB 統合テストに整理、条件分岐は eventHelper.test に委譲
 */

import {
  describe,
  it,
  expect,
  afterEach,
  vi
} from "vitest";
import {
  fetchEvents,
  fetchEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  fetchParticipantsByEvent,
  createParticipant,
  updateParticipant,
  cancelParticipant,
} from "./eventApi";
import { supabase } from "./supabase";

vi.mock("./supabase", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

const mockFrom = supabase.from as any;

describe("eventApi", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("fetchEvents", () => {
    it("returns events on success", async () => {
      const data = [{ event_id: 1 }];
      const orderLast = vi.fn().mockResolvedValue({ data, error: null });
      const orderFirst = vi.fn().mockReturnValue({ order: orderLast });
      const select = vi.fn().mockReturnValue({ order: orderFirst });

      mockFrom.mockReturnValue({ select });

      const res = await fetchEvents();

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(select).toHaveBeenCalled();
      expect(res.success).toBe(true);
      expect(res.data).toEqual(data);
    });

    it("returns error when supabase fails", async () => {
      const orderLast = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "error" },
      });
      const orderFirst = vi.fn().mockReturnValue({ order: orderLast });
      const select = vi.fn().mockReturnValue({ order: orderFirst });

      mockFrom.mockReturnValue({ select });

      const res = await fetchEvents();

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe("fetchEventById", () => {
    it("returns single event on success", async () => {
      const data = {
        id: 1,
        title: "Test Event"
      };

      // 実際のSDKの順序: from().select().eq().single() に合わせる
      const single = vi.fn().mockResolvedValue({
        data,
        error: null
      });
      const eq = vi.fn().mockReturnValue({
        single
      });
      const select = vi.fn().mockReturnValue({
        eq
      });

      mockFrom.mockReturnValue({
        select
      });

      const res = await fetchEventById(1);

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(select).toHaveBeenCalled();
      expect(res.success).toBe(true);
      expect(res.data).toEqual(data);
    });
  });

  describe("createEvent", () => {
    it("calls supabase.from('events').insert() and returns success with data", async () => {
      const created = {
        event_id: 10,
        title: "Test Event",
        date: "2026-03-01",
        start_time: "10:00",
        end_time: "12:00",
        place: "大場A",
        capacity: 20,
        min_level: null,
        max_level: null,
        gender_rule: "none",
        pair_rule: "solo",
        parking_capacity: 5,
        created_at: "2026-02-27T00:00:00Z",
        updated_at: "2026-02-27T00:00:00Z",
      };
      const single = vi.fn().mockResolvedValue({
        data: created,
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });

      mockFrom.mockReturnValue({ insert });

      const input = {
        title: "Test Event",
        date: "2026-03-01",
        start_time: "10:00",
        end_time: "12:00",
        place: "大場A",
        capacity: 20,
        min_level: null,
        max_level: null,
        gender_rule: "none" as const,
        pair_rule: "solo" as const,
        parking_capacity: 5,
      };
      const res = await createEvent(input);

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(insert).toHaveBeenCalledWith([input]);
      expect(select).toHaveBeenCalled();
      expect(res.success).toBe(true);
      expect(res.data).toEqual(created);
    });

    it("returns error when insert fails", async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "insert failed" },
      });
      const select = vi.fn().mockReturnValue({ single });
      const insert = vi.fn().mockReturnValue({ select });

      mockFrom.mockReturnValue({ insert });

      const input = {
        title: "Bad",
        date: "2026-03-01",
        start_time: "10:00",
        end_time: "12:00",
        place: "大場A",
        capacity: 0,
        min_level: null,
        max_level: null,
        gender_rule: "none" as const,
        pair_rule: "solo" as const,
        parking_capacity: 0,
      };
      const res = await createEvent(input);

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe("updateEvent", () => {
    it("calls supabase.from('events').update().eq().select().single()", async () => {
      const updated = {
        event_id: 10,
        title: "Updated Event",
        date: "2026-03-02",
        start_time: "11:00",
        end_time: "13:00",
        place: "大場B",
        capacity: 30,
        min_level: null,
        max_level: null,
        gender_rule: "none",
        pair_rule: "solo",
        parking_capacity: 10,
        created_at: "2026-02-27T00:00:00Z",
        updated_at: "2026-02-27T12:00:00Z",
      };
      const single = vi.fn().mockResolvedValue({
        data: updated,
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });

      mockFrom.mockReturnValue({ update });

      const input = { title: "Updated Event", capacity: 30 };
      const res = await updateEvent(10, input);

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(update).toHaveBeenCalled();
      expect(eq).toHaveBeenCalledWith("event_id", 10);
      expect(select).toHaveBeenCalled();
      expect(res.success).toBe(true);
      expect(res.data).toEqual(updated);
    });

    it("returns error when update fails", async () => {
      const single = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "update failed" },
      });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });

      mockFrom.mockReturnValue({ update });

      const res = await updateEvent(1, { title: "Bad" });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe("deleteEvent", () => {
    it("calls supabase.from('events').delete().eq() and returns success", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });

      mockFrom.mockReturnValue({ delete: vi.fn().mockReturnValue({ eq }) });

      const res = await deleteEvent(10);

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(eq).toHaveBeenCalledWith("event_id", 10);
      expect(res.success).toBe(true);
    });

    it("returns error when delete fails", async () => {
      const eq = vi.fn().mockResolvedValue({
        error: { message: "delete failed" },
      });

      mockFrom.mockReturnValue({ delete: vi.fn().mockReturnValue({ eq }) });

      const res = await deleteEvent(1);

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe("fetchParticipantsByEvent", () => {
    it("returns all participants for the given event_id from participants table", async () => {
      const data = [
        { participant_id: 1, event_id: 10, user_id: "u1", status: "confirmed" },
        { participant_id: 2, event_id: 10, user_id: "u2", status: "pending" },
      ];
      const eq = vi.fn().mockResolvedValue({ data, error: null });
      const select = vi.fn().mockReturnValue({ eq });

      mockFrom.mockReturnValue({ select });

      const res = await fetchParticipantsByEvent(10);

      expect(mockFrom).toHaveBeenCalledWith("participants");
      expect(select).toHaveBeenCalledWith("*");
      expect(eq).toHaveBeenCalledWith("event_id", 10);
      expect(res.success).toBe(true);
      expect(res.data).toEqual(data);
    });

    it("returns error when supabase fails", async () => {
      const eq = vi.fn().mockResolvedValue({
        data: null,
        error: { message: "fetch failed" },
      });
      const select = vi.fn().mockReturnValue({ eq });

      mockFrom.mockReturnValue({ select });

      const res = await fetchParticipantsByEvent(1);

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });
  });

  describe("createParticipant", () => {
    it("succeeds when event and participants are fetched and insert is called", async () => {
      const eventData = {
        event_id: 1,
        date: "2026-12-01",
        capacity: 10,
        parking_capacity: 0,
      };
      const singleEvent = vi.fn().mockResolvedValue({
        data: eventData,
        error: null,
      });
      const eqEvent = vi.fn().mockReturnValue({ single: singleEvent });
      const selectEvent = vi.fn().mockReturnValue({ eq: eqEvent });

      const eqPart = vi.fn().mockResolvedValue({ data: [], error: null });
      const selectPart = vi.fn().mockReturnValue({ eq: eqPart });

      const mockResult = {
        event_id: 1,
        user_id: "user1",
        status: "pending",
      };
      const singleIns = vi.fn().mockResolvedValue({
        data: mockResult,
        error: null,
      });
      const selectIns = vi.fn().mockReturnValue({ single: singleIns });
      const insertFn = vi.fn().mockReturnValue({ select: selectIns });

      let partCalls = 0;
      mockFrom.mockImplementation((table: string) => {
        if (table === "events") return { select: selectEvent };
        if (table === "participants") {
          partCalls++;
          if (partCalls === 1) return { select: selectPart };
          return { insert: insertFn };
        }
        return {};
      });

      const res = await createParticipant({
        event_id: 1,
        user_id: "user1",
        parking_requested: false,
      });

      expect(mockFrom).toHaveBeenCalledWith("events");
      expect(mockFrom).toHaveBeenCalledWith("participants");
      expect(res.success).toBe(true);
      expect(res.data?.event_id).toBe(1);
    });
  });

  describe("updateParticipant", () => {
    it("returns success when update succeeds", async () => {
      const single = vi.fn().mockResolvedValue({
        data: { event_id: 1 },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });

      mockFrom.mockReturnValue({ update });

      const res = await updateParticipant(1, { parking_requested: true });

      expect(res.success).toBe(true);
    });
  });

  describe("cancelParticipant", () => {
    it("returns success when update succeeds", async () => {
      const eq = vi.fn().mockResolvedValue({ error: null });
      const update = vi.fn().mockReturnValue({ eq });

      mockFrom.mockReturnValue({ update });

      const res = await cancelParticipant(1);

      expect(mockFrom).toHaveBeenCalledWith("participants");
      expect(res.success).toBe(true);
    });
  });
});