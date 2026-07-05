import { describe, expect, it } from "vitest";
import { MAX_ORIGINAL_BYTES } from "@/server/upload/photo-upload-steps";

describe("photo upload constants", () => {
  it("allows originals up to 50MB", () => {
    expect(MAX_ORIGINAL_BYTES).toBe(50 * 1024 * 1024);
  });
});

describe("upload progress mapping", () => {
  it("maps byte progress into 10-80 range", () => {
    const mapProgress = (loaded: number, total: number) => {
      const ratio = loaded / total;
      return Math.min(80, Math.round(10 + ratio * 70));
    };

    expect(mapProgress(0, 1000)).toBe(10);
    expect(mapProgress(500, 1000)).toBe(45);
    expect(mapProgress(1000, 1000)).toBe(80);
  });
});

describe("batch completion detection", () => {
  it("considers batch complete when all uploads finished or failed", () => {
    const uploads = [
      { status: "COMPLETE" },
      { status: "COMPLETE" },
      { status: "FAILED" },
    ];
    const total = uploads.length;
    const completed = uploads.filter((u) => u.status === "COMPLETE").length;
    const failed = uploads.filter((u) => u.status === "FAILED").length;
    const isComplete = total > 0 && completed + failed === total;
    expect(isComplete).toBe(true);
  });
});
