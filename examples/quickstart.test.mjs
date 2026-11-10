import assert from "node:assert/strict";
import test from "node:test";
import { sliceFilesByType } from "@red-cup-engineering/file-type-slicing-service";

test("FILE-TYPES-QUICKSTART", () => {
  const result = sliceFilesByType({ files: [
    { kind: "file", path: "src/one.mjs", bytes: 12 },
    { kind: "file", path: "src/two.MJS", bytes: 20 },
  ] });
  assert.equal(result.slices.mjs.count, 2);
  assert.equal(result.slices.mjs.bytes, 32);
});
