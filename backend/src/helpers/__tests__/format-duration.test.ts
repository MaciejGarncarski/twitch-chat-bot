import { formatDuration } from "@/helpers/format-duration"
import { describe, expect, test } from "bun:test"

describe("format-duration", () => {
  test("should return valid formatted duration", () => {
    const a = formatDuration(60)
    const b = formatDuration(3661)
    const c = formatDuration(0)
    const d = formatDuration(-5)
    const e = formatDuration(Infinity)

    expect(a).toBe("1:00")
    expect(b).toBe("1:01:01")
    expect(c).toBe("0:00")
    expect(d).toBe("0:00")
    expect(e).toBe("0:00")
  })
})
