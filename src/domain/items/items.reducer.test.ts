import { describe, it, expect } from "vitest";
import { listReducer } from "./items.reducer";
import type { Item, ItemsState } from "./items.types";
import {
    item,
    readyState,
    snapshotItems,
    filteredItems,
    readyStateWithItems
} from "./items.test.helpers";
import type { ReadyItemsState } from "./items.test.helpers";

function deletingState({
    snapshot,
    requestId
}: {
    snapshot: Item[];
    requestId: number;
}): ReadyItemsState {
    const filtered = filteredItems(snapshot);

    return readyState({
        items: filtered,
        delete: {
            kind: "deleting",
            requestId,
            snapshot
        }
    })
}

function deleteErrorState({
    snapshot,
    requestId,
    error = "Delete failed"
}: {
    snapshot: Item[];
    requestId: number;
    error?: string;
}): ReadyItemsState {
    const filtered = filteredItems(snapshot);

    return readyState({
        items: filtered,
        delete: {
            kind: "error",
            requestId,
            error,
            snapshot
        }
    })
}

function expectDeleteIdle(state: ReadyItemsState) {
    expect(state.delete).toEqual({ kind: "idle" });
}

function expectCreateIdle(state: ReadyItemsState) {
    expect(state.create).toEqual({ kind: "idle" });
}

function expectDeleting(
    state: ReadyItemsState,
    snapshot: Item[],
    requestId: number
) {
    expect(state.delete.kind).toBe("deleting");
    if (state.delete.kind === "deleting") {
        expect(state.delete.snapshot).toEqual(snapshot);
        expect(state.delete.requestId).toBe(requestId);
    }
}

describe("listReducer", () => {
    describe("LOAD_START Tests", () => {
        it("LOAD_START -> loading, preserved items, stores requestId", () => {
            const start: ItemsState = { status: "idle", items: [item()] };

            const next = listReducer(start, { type: "LOAD_START", requestId: 1 });

            expect(next.status).toBe("loading");
            if (next.status === "loading") {
                expect(next.requestId).toBe(1);
                expect(next.items).toBe(start.items);
            }
        });
    })

    describe("LOAD_SUCCESS Tests", () => {
        it("LOAD_SUCCESS -> ready with items + idle create/delete", () => {
            const start: ItemsState = { status: "loading", items: [], requestId: 2 };

            const loaded = [item({ id: "a" }), item({ id: "b" })]
            const next = listReducer(start, { type: "LOAD_SUCCESS", requestId: 2, items: loaded });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.items).toEqual(loaded);
                expectCreateIdle(next);
                expectDeleteIdle(next);
            }
        });

        it("LOAD_SUCCESS ignored if not in loading state", () => {
            const start: ItemsState = { status: "idle", items: [] };

            const next = listReducer(start, { type: "LOAD_SUCCESS", requestId: 1, items: [item()] });

            expect(next).toBe(start);
        });

        it("LOAD_SUCCESS ignored if requestId mismatches", () => {
            const start: ItemsState = { status: "loading", requestId: 1, items: [] };

            const next = listReducer(start, { type: "LOAD_SUCCESS", requestId: 2, items: [item()] });

            expect(next).toBe(start);
        });
    });

    /* LOAD_ERROR Tests (3) */
    describe("LOAD_ERROR Tests", () => {
        it("LOAD_ERROR -> error, preserved items, stores error when requestId matches", () => {
            const start: ItemsState = { status: "loading", items: [item({ id: "1" }), item({ id: "2" })], requestId: 5 };

            const next = listReducer(start, { type: "LOAD_ERROR", requestId: 5, error: "Error message" });

            expect(next.status).toBe("error");
            if (next.status === "error") {
                expect(next.items).toBe(start.items);
                expect(next.error).toBe("Error message");
            }
        });

        it("LOAD_ERROR ignored if not in loading state", () => {
            const start: ItemsState = { status: "idle", items: [] };

            const next = listReducer(start, { type: "LOAD_ERROR", requestId: 3, error: "Error message" });

            expect(next).toBe(start);
        });

        it("LOAD_ERROR ignored if requestId mismatches", () => {
            const start: ItemsState = { status: "loading", items: [], requestId: 5 };

            const next = listReducer(start, { type: "LOAD_ERROR", requestId: 3, error: "Error message" });

            expect(next).toBe(start);
        });
    });

    /* SELECT_ITEM Tests (3) */
    describe("SELECT_ITEM Tests", () => {
        it("SELECT_ITEM toggles selected for existing item (ready only)", () => {
            const start: ItemsState = readyStateWithItems([item({ id: "1" }), item({ id: "2" })]);

            const next = listReducer(start, { type: "SELECT_ITEM", id: "2", selected: true });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                const updated = next.items.find(item => item.id === "2");
                expect(updated?.selected).toBe(true);
            }
        });

        it("SELECT_ITEM ignored when there is no matched id", () => {
            const loaded = [item({ id: "1", selected: true }), item({ id: "2", selected: false })];
            const start: ItemsState = readyState({ items: loaded });

            const next = listReducer(start, { type: "SELECT_ITEM", id: "3", selected: true });

            expect(next).toBe(start);
        });

        it("SELECT_ITEM ignored when status is not ready", () => {
            const loaded = [item({ id: "1", selected: true }), item({ id: "2", selected: false })];
            const start: ItemsState = { status: "loading", items: loaded, requestId: 1 };

            const next = listReducer(start, { type: "SELECT_ITEM", id: "1", selected: true });

            expect(next).toBe(start);
        });
    });

    describe("CREATE_START Tests", () => {
        it("CREATE_START create.creating with requestId (ready only)", () => {
            const start: ItemsState = readyState();

            const next = listReducer(start, { type: "CREATE_START", requestId: 5 });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.create).toEqual({ kind: "creating", requestId: 5 });
            }
        });

        it("CREATE_START ignored when create.kind is not idle", () => {
            const start: ItemsState = readyState({ create: { kind: "creating", requestId: 5 } });

            const next = listReducer(start, { type: "CREATE_START", requestId: 5 });

            expect(next).toBe(start);
        });
    });

    describe("CREATE_SUCCESS Tests", () => {
        it("CREATE_SUCCESS append the new item and reset create to idle when requestId matches (ready only)", () => {
            const start: ItemsState = readyStateWithItems(
                [item({ id: "1" }), item({ id: "2" })],
                { create: { kind: "creating", requestId: 6 } }
            );

            const newItem = item({ id: "10", title: "New item", selected: false });
            const next = listReducer(start, { type: "CREATE_SUCCESS", requestId: 6, item: newItem });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.items).toHaveLength(3);
                expect(next.items.some(i => i.id === "10")).toBe(true);
                expectCreateIdle(next);
            }
        });

        it("CREATE_SUCCESS ignored when create.kind is not creating", () => {
            const start: ItemsState = readyState({ create: { kind: "idle" } });

            const newItem = item({ id: "10", title: "New item", selected: false });
            const next = listReducer(start, { type: "CREATE_SUCCESS", requestId: 6, item: newItem });

            expect(next).toBe(start);
        });

        it("CREATE_SUCCESS ignored when requestId mismatches", () => {
            const start: ItemsState = readyState({ create: { kind: "creating", requestId: 5 } });

            const newItem = item({ id: "10", title: "New item", selected: false });
            const next = listReducer(start, { type: "CREATE_SUCCESS", requestId: 6, item: newItem });

            expect(next).toBe(start);
        });
    });

    describe("CREATE_ERROR Tests", () => {
        it("CREATE_ERROR create.error, preserved items, stores error in create when requestId matches (ready only)", () => {
            const start: ItemsState = readyState({ create: { kind: "creating", requestId: 6 } });

            const next = listReducer(start, { type: "CREATE_ERROR", requestId: 6, error: "New item error" });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.items).toBe(start.items);
                expect(next.create.kind).toBe("error");
                if (next.create.kind === "error") {
                    expect(next.create.error).toBe("New item error")
                }
            }
        });

        it("CREATE_ERROR ignored when create.kind is not creating", () => {
            const start: ItemsState = readyState({ create: { kind: "idle" } });

            const next = listReducer(start, { type: "CREATE_ERROR", requestId: 6, error: "New item error" });

            expect(next).toBe(start);
        });

        it("CREATE_ERROR ignored when requestId mismatches", () => {
            const start: ItemsState = readyState({ create: { kind: "creating", requestId: 5 } });

            const next = listReducer(start, { type: "CREATE_ERROR", requestId: 6, error: "New item error" });

            expect(next).toBe(start);
        });
    });

    describe("DELETE_START Tests", () => {
        it("DELETE_START delete.deleting with requestId (ready only)", () => {
            const loaded = [item({ id: "1", selected: true }), item({ id: "2", selected: false })];
            const start: ItemsState = readyState({ items: loaded });

            const next = listReducer(start, { type: "DELETE_START", requestId: 3 });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.items.map(i => i.id)).toEqual(["2"])
                expectDeleting(next, start.items, 3);
            }
        });
    });

    describe("DELETE_SUCCESS Tests", () => {
        it("DELETE_SUCCESS reset delete to idle when requestId matches (ready only)", () => {
            const start = deletingState({ snapshot: snapshotItems(), requestId: 4 });

            const next = listReducer(start, { type: "DELETE_SUCCESS", requestId: 4 });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.items).toBe(start.items);
                expectDeleteIdle(next);
            }
        });

        it("DELETE_SUCCESS ignored when delete.kind is not deleting", () => {
            const start: ItemsState = readyState({ delete: { kind: "idle" } });

            const next = listReducer(start, { type: "DELETE_SUCCESS", requestId: 4 });

            expect(next).toBe(start);
        });

        it("DELETE_SUCCESS ignored when requestId mismatches", () => {
            const start = deletingState({ snapshot: snapshotItems(), requestId: 2 });

            const next = listReducer(start, { type: "DELETE_SUCCESS", requestId: 4 });

            expect(next).toBe(start);
        });
    });

    describe("DELETE_ERROR Tests", () => {
        it("DELETE_ERROR delete.error, restores deleted items, preserved snapshot, stores error in delete when requestId matches (ready only)", () => {
            const snapshot = snapshotItems();
            const start = deletingState({ snapshot, requestId: 4 });

            const next = listReducer(start, { type: "DELETE_ERROR", requestId: 4, error: "Delete error" });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.items).toEqual(snapshot);
                expect(next.delete.kind).toBe("error");
                if (next.delete.kind === "error") {
                    expect(next.delete.error).toBe("Delete error");
                    expect(next.delete.snapshot).toEqual(snapshot)
                }
            }
        });

        it("DELETE_ERROR ignored when delete.kind is not deleting", () => {
            const start: ItemsState = readyState({ delete: { kind: "idle" } });

            const next = listReducer(start, { type: "DELETE_ERROR", requestId: 4, error: "Delete error" });

            expect(next).toBe(start);
        });

        it("DELETE_ERROR ignored when requestId mismatches", () => {
            const start = deletingState({ snapshot: snapshotItems(), requestId: 2 });

            const next = listReducer(start, { type: "DELETE_ERROR", requestId: 4, error: "Delete error" });

            expect(next).toBe(start);
        });
    });

    describe("DELETE_UNDO Tests", () => {
        it("DELETE_UNDO restore deleted items, reset delete to idle when requestId matches (ready only)", () => {
            const snapshot = snapshotItems()
            const start = deletingState({ snapshot, requestId: 4 });

            const next = listReducer(start, { type: "DELETE_UNDO", requestId: 4 });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.items).toEqual(snapshot);
                expectDeleteIdle(next);
            }
        });

        it("DELETE_UNDO ignored when delete.kind is not deleting/error", () => {
            const start: ItemsState = readyState({ delete: { kind: "idle" } });

            const next = listReducer(start, { type: "DELETE_UNDO", requestId: 4 });

            expect(next).toBe(start);
        });

        it("DELETE_UNDO ignored when requestId mismatches", () => {
            const start = deletingState({ snapshot: snapshotItems(), requestId: 1 });

            const next = listReducer(start, { type: "DELETE_UNDO", requestId: 4 });

            expect(next).toBe(start);
        });
    });

    describe("DELETE_RETRY Tests", () => {
        it("DELETE_RETRY similar to DELETE_START when requestId matches and delete.kind is error (retries to execute again fail delete - ready only)", () => {
            const snapshot = snapshotItems();
            const start = deleteErrorState({ snapshot, requestId: 4 });

            const next = listReducer(start, { type: "DELETE_RETRY", requestId: 4 });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expect(next.items).toEqual(filteredItems(snapshot));
                expectDeleting(next, snapshot, 4);
            }
        });

        it("DELETE_RETRY ignored when delete.kind is not error", () => {
            const start: ItemsState = readyState({ delete: { kind: "idle" } });

            const next = listReducer(start, { type: "DELETE_RETRY", requestId: 4 });

            expect(next).toBe(start);
        });

        it("DELETE_RETRY ignored when requestId mismatches", () => {
            const start = deleteErrorState({ snapshot: snapshotItems(), requestId: 1 });

            const next = listReducer(start, { type: "DELETE_RETRY", requestId: 4 });

            expect(next).toBe(start);
        });
    });

    describe("DELETE_COMMIT Tests", () => {
        it("DELETE_COMMIT reset delete.kind to idle (ready only)", () => {
            const start = deletingState({ snapshot: snapshotItems(), requestId: 4 });

            const next = listReducer(start, { type: "DELETE_COMMIT", requestId: 4 });

            expect(next.status).toBe("ready");
            if (next.status === "ready") {
                expectDeleteIdle(next);
            }
        });

        it("DELETE_COMMIT ignored when delete.kind is not deleting", () => {
            const start: ItemsState = readyState({ delete: { kind: "idle" } });

            const next = listReducer(start, { type: "DELETE_COMMIT", requestId: 4 });

            expect(next).toBe(start);
        });

        it("DELETE_COMMIT ignored when requestId mismatches", () => {
            const start = deletingState({ snapshot: snapshotItems(), requestId: 1 });

            const next = listReducer(start, { type: "DELETE_COMMIT", requestId: 4 });

            expect(next).toBe(start);
        });
    });
});