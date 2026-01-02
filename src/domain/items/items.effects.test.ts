import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createItemsEffects } from "./items.effects";
import type { ItemsRepository } from "./items.repository";
import type { ItemsAction } from "./items.types";

describe("createItemsEffects", () => {
    let repo: ItemsRepository;
    let dispatch: (a: ItemsAction) => void;

    beforeEach(() => {
        dispatch = vi.fn();
        repo = {
            loadItems: vi.fn(),
            createItem: vi.fn(),
            deleteItems: vi.fn()
        };
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe("loadItems Tests", () => {
        it("dispatches LOAD_START then LOAD_SUCCESS", async () => {
            (repo.loadItems as any).mockResolvedValue([
                { id: "1", title: "Item A", selected: false }
            ]);

            const fx = createItemsEffects(repo, dispatch);
            await fx.loadItems();

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "LOAD_START", requestId: 1 });
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                type: "LOAD_SUCCESS",
                requestId: 1,
                items: [{ id: "1", title: "Item A", selected: false }]
            });
        });

        it("dispatches LOAD_ERROR on failure", async () => {
            (repo.loadItems as any).mockRejectedValue(new Error("Failed to load list"));

            const fx = createItemsEffects(repo, dispatch);
            await fx.loadItems();

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "LOAD_START", requestId: 1 });
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                type: "LOAD_ERROR",
                requestId: 1,
                error: "Failed to load items"
            });
        });
    });

    describe("addItem Tests", () => {
        it("dispatches CREATE_START then CREATE_SUCCESS", async () => {
            (repo.createItem as any).mockResolvedValue(
                { id: "3", title: "New item", selected: false }
            );

            const fx = createItemsEffects(repo, dispatch);
            await fx.addItem("New item");

            expect(repo.createItem).toHaveBeenCalledWith("New item");

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "CREATE_START", requestId: 1 });
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                type: "CREATE_SUCCESS",
                requestId: 1,
                item: { id: "3", title: "New item", selected: false }
            });
        });

        it("dispatches CREATE_ERROR on failure", async () => {
            (repo.createItem as any).mockRejectedValue(new Error("Failed to add item"));

            const fx = createItemsEffects(repo, dispatch);
            await fx.addItem("New item");

            expect(repo.createItem).toHaveBeenCalledWith("New item");

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "CREATE_START", requestId: 1 });
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                type: "CREATE_ERROR",
                requestId: 1,
                error: "Failed to add item"
            });
        });
    });

    describe("deleteItems Tests", () => {
        it("dispatches DELETE_START then DELETE_COMMIT", async () => {
            vi.useFakeTimers();

            (repo.deleteItems as any).mockResolvedValue(["1", "2"]);

            const fx = createItemsEffects(repo, dispatch);
            await fx.deleteItems(["1", "2"]);

            expect(repo.deleteItems).toHaveBeenCalledWith(["1", "2"]);

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "DELETE_START", requestId: 1 });

            vi.advanceTimersByTime(5000);
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                type: "DELETE_COMMIT",
                requestId: 1
            });
        });

        it("dispatches DELETE_ERROR on failure", async () => {
            (repo.deleteItems as any).mockRejectedValue(new Error("Failed to delete items"));

            const fx = createItemsEffects(repo, dispatch);
            await fx.deleteItems(["1", "2"]);

            expect(repo.deleteItems).toHaveBeenCalledWith(["1", "2"]);

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "DELETE_START", requestId: 1 });
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                type: "DELETE_ERROR",
                requestId: 1,
                error: "Failed to delete items"
            });
        });
    });

    describe("undoDelete Tests", () => {
        it("dispatches DELETE_UNDO", () => {
            const fx = createItemsEffects(repo, dispatch);
            fx.undoDelete(1);

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "DELETE_UNDO", requestId: 1 });
        });
    });

    describe("retryDelete Tests", () => {
        it("dispatches DELETE_RETRY then DELETE_SUCCESS", async () => {
            (repo.deleteItems as any).mockResolvedValue(undefined);

            const fx = createItemsEffects(repo, dispatch);
            await fx.retryDelete(1, ["1", "2"]);

            expect(repo.deleteItems).toHaveBeenCalledWith(["1", "2"]);

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "DELETE_RETRY", requestId: 1 });
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                type: "DELETE_SUCCESS",
                requestId: 1
            });
        });

        it("dispatches DELETE_ERROR on retry failure", async () => {
            (repo.deleteItems as any).mockRejectedValue(undefined);

            const fx = createItemsEffects(repo, dispatch);
            await fx.retryDelete(1, ["1", "2"]);

            expect(repo.deleteItems).toHaveBeenCalledWith(["1", "2"]);

            expect(dispatch).toHaveBeenNthCalledWith(1, { type: "DELETE_RETRY", requestId: 1 });
            expect(dispatch).toHaveBeenNthCalledWith(2, {
                type: "DELETE_ERROR",
                requestId: 1,
                error: "Delete failed"
            });
        });
    });

    describe("toggleItemSelection Tests", () => {
        it("toggles item checkbox mark", async () => {
            const fx = createItemsEffects(repo, dispatch);
            await fx.toggleItemSelection("1", true);

            expect(dispatch).toHaveBeenCalledWith({ type: "SELECT_ITEM", id: "1", selected: true });
            expect(repo.loadItems).not.toHaveBeenCalled();
            expect(repo.createItem).not.toHaveBeenCalled();
            expect(repo.deleteItems).not.toHaveBeenCalled();
        });
    });
})