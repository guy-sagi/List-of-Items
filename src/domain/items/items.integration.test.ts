import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { listReducer } from "./items.reducer";
import { createItemsEffects } from "./items.effects";
import type { ItemsRepository } from "./items.repository";
import type { ItemsState, ItemsAction } from "./items.types";
import {
    item,
    readyState,
    snapshotItems,
    filteredItems
} from "./items.test.helpers";
import type { ReadyItemsState } from "./items.test.helpers";

function expectReady(state: ItemsState): ReadyItemsState {
    expect(state.status).toBe("ready");
    return state as ReadyItemsState;
}

function createTestStore(initial: ItemsState) {
    let state = initial;

    const dispatch = (action: ItemsAction) => {
        state = listReducer(state, action);
    }

    return {
        dispatch,
        getState: () => state
    };
}

function expectDeleteIdle(state: ReadyItemsState) {
    expect(state.delete).toEqual({ kind: "idle" });
}

function expectCreateIdle(state: ReadyItemsState) {
    expect(state.create).toEqual({ kind: "idle" });
}

describe("Items integration tests", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });
    
    afterEach(() => {
        vi.useRealTimers();
    });

    it("delete -> undo restores items", async () => {
        vi.useFakeTimers();

        const initialState = readyState({
            items: [
                { id: "1", title: "Item 1", selected: true },
                { id: "2", title: "Item 2", selected: false }
            ],
        });

        const store = createTestStore(initialState);

        const repo: ItemsRepository = {
            loadItems: vi.fn(),
            createItem: vi.fn(),
            deleteItems: vi.fn().mockResolvedValue(undefined)
        }

        const fx = createItemsEffects(repo, store.dispatch);

        await fx.deleteItems(["1"]);

        let s = expectReady(store.getState());
        expect(s.delete.kind).toBe("deleting");
        expect(s.items.map(i => i.id)).toEqual(["2"]);

        fx.undoDelete(1);

        expect(repo.deleteItems).toHaveBeenCalledTimes(1);
        expect(repo.deleteItems).toHaveBeenCalledWith(["1"]);

        s = expectReady(store.getState());
        expect(s.items.map(i => i.id)).toEqual(["1", "2"]);
        expectDeleteIdle(s);

        vi.advanceTimersByTime(5000);

        s = expectReady(store.getState());
        expect(s.items.map(i => i.id)).toEqual(["1", "2"]);
        expectDeleteIdle(s);
    });
});