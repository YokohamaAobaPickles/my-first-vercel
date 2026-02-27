/**
 * Filename: src/utils/eventHelper.test.ts
 * Version: V1.0.0
 * Update: 2026-02-27
 * Remarks: V1.0.0 - eventHelpers ロジック専用単体テスト
 */

import { describe, it, expect } from "vitest";
import {
  isLotteryClosed,
  calculateParticipantStatus,
} from "./eventHelpers";

describe("eventHelpers", () => {
  describe("isLotteryClosed", () => {
    it("returns false when reference is 1 second before deadline (23:59:59)", () => {
      const eventDate = "2026-03-15";
      const deadline = new Date(eventDate);
      deadline.setHours(23, 59, 59, 999);
      const oneSecondBefore = new Date(deadline.getTime() - 1000);
      expect(isLotteryClosed(eventDate, oneSecondBefore)).toBe(false);
    });

    it("returns true when reference is 1 second after deadline (23:59:59)", () => {
      const eventDate = "2026-03-15";
      const deadline = new Date(eventDate);
      deadline.setHours(23, 59, 59, 999);
      const oneSecondAfter = new Date(deadline.getTime() + 1000);
      expect(isLotteryClosed(eventDate, oneSecondAfter)).toBe(true);
    });

    it("uses 23:59:59.999 as deadline boundary (at or past)", () => {
      const eventDate = "2026-06-01";
      const deadline = new Date(eventDate);
      deadline.setHours(23, 59, 59, 999);
      expect(isLotteryClosed(eventDate, deadline)).toBe(false);
      expect(isLotteryClosed(eventDate, new Date(deadline.getTime() + 1))).toBe(
        true
      );
    });
  });

  describe("calculateParticipantStatus", () => {
    const eventBase = {
      date: "2026-04-01",
      capacity: 2,
      parking_capacity: 1,
    };

    it("returns pending when before lottery (reference before deadline)", () => {
      const ref = new Date("2026-03-01T12:00:00Z");
      const result = calculateParticipantStatus(
        eventBase,
        [],
        false,
        ref
      );
      expect(result.status).toBe("pending");
      expect(result.parking).toBeNull();
    });

    it("returns pending when before lottery even if capacity available", () => {
      const ref = new Date("2026-03-01T12:00:00Z");
      const result = calculateParticipantStatus(
        eventBase,
        [{ status: "confirmed", parking: null }],
        false,
        ref
      );
      expect(result.status).toBe("pending");
      expect(result.parking).toBeNull();
    });

    it("returns confirmed when after lottery and capacity available", () => {
      const ref = new Date("2026-04-02T00:00:00Z");
      const result = calculateParticipantStatus(
        eventBase,
        [{ status: "confirmed", parking: null }],
        false,
        ref
      );
      expect(result.status).toBe("confirmed");
      expect(result.parking).toBeNull();
    });

    it("returns pending (waitlist) when after lottery and at capacity", () => {
      const ref = new Date("2026-04-02T00:00:00Z");
      const participants = [
        { status: "confirmed" as const, parking: null },
        { status: "confirmed" as const, parking: null },
      ];
      const result = calculateParticipantStatus(
        eventBase,
        participants,
        false,
        ref
      );
      expect(result.status).toBe("pending");
      expect(result.parking).toBeNull();
    });

    it("returns parking true when after lottery and parking slot available", () => {
      const ref = new Date("2026-04-02T00:00:00Z");
      const result = calculateParticipantStatus(
        eventBase,
        [],
        true,
        ref
      );
      expect(result.status).toBe("confirmed");
      expect(result.parking).toBe(true);
    });

    it("returns parking false when after lottery but parking full (body confirmed, parking waitlist)", () => {
      const ref = new Date("2026-04-02T00:00:00Z");
      const participants = [
        { status: "confirmed" as const, parking: true as const },
      ];
      const result = calculateParticipantStatus(
        eventBase,
        participants,
        true,
        ref
      );
      expect(result.status).toBe("confirmed");
      expect(result.parking).toBe(false);
    });

    it("returns parking null when not requested", () => {
      const ref = new Date("2026-04-02T00:00:00Z");
      const result = calculateParticipantStatus(
        eventBase,
        [],
        false,
        ref
      );
      expect(result.parking).toBeNull();
    });

    it("handles null capacity and parking_capacity (treated as 0)", () => {
      const ref = new Date("2026-04-02T00:00:00Z");
      const result = calculateParticipantStatus(
        { date: "2026-04-01", capacity: null, parking_capacity: null },
        [],
        true,
        ref
      );
      expect(result.status).toBe("pending");
      expect(result.parking).toBe(false);
    });
  });
});
