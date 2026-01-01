import { describe, test, expect } from "bun:test"

import { VoteManager } from "@/core/vote-manager"

describe("VoteManager", () => {
  describe("addVote", () => {
    test("adds vote and returns current count", () => {
      const vm = new VoteManager()

      const count = vm.addVote("user1")

      expect(count).toBe(1)
    })

    test("increments count for different users", () => {
      const vm = new VoteManager()

      vm.addVote("user1")
      const count = vm.addVote("user2")

      expect(count).toBe(2)
    })

    test("does not increment for duplicate votes", () => {
      const vm = new VoteManager()

      vm.addVote("user1")
      const count = vm.addVote("user1")

      expect(count).toBe(1)
    })
  })

  describe("hasVoted", () => {
    test("returns false when user has not voted", () => {
      const vm = new VoteManager()

      expect(vm.hasVoted("user1")).toBe(false)
    })

    test("returns true when user has voted", () => {
      const vm = new VoteManager()
      vm.addVote("user1")

      expect(vm.hasVoted("user1")).toBe(true)
    })

    test("is case-sensitive", () => {
      const vm = new VoteManager()
      vm.addVote("User1")

      expect(vm.hasVoted("user1")).toBe(false)
      expect(vm.hasVoted("User1")).toBe(true)
    })
  })

  describe("getVotesNeeded", () => {
    test("returns configured votes needed threshold", () => {
      const vm = new VoteManager()

      expect(vm.getVotesNeeded()).toBe(2)
    })
  })

  describe("getCurrentCount", () => {
    test("returns 0 when no votes", () => {
      const vm = new VoteManager()

      expect(vm.getCurrentCount()).toBe(0)
    })

    test("returns correct count after votes", () => {
      const vm = new VoteManager()
      vm.addVote("user1")
      vm.addVote("user2")
      vm.addVote("user3")

      expect(vm.getCurrentCount()).toBe(3)
    })
  })

  describe("reset", () => {
    test("clears all votes", () => {
      const vm = new VoteManager()
      vm.addVote("user1")
      vm.addVote("user2")

      vm.reset()

      expect(vm.getCurrentCount()).toBe(0)
      expect(vm.hasVoted("user1")).toBe(false)
      expect(vm.hasVoted("user2")).toBe(false)
    })
  })
})
