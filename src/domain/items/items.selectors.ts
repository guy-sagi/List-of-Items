import { ItemsState } from "./items.types";

export function isReady(state: ItemsState): state is Extract<ItemsState, { status: "ready" }> {
    return state.status === "ready";
}

export function isCreating(state: ItemsState): boolean {
    return isReady(state) && state.create.kind === "creating";
}

export function createError(state: ItemsState): string | undefined {
    return isReady(state) && state.create.kind === "error" ? state.create.error : undefined;
}

export function isDeleting(state: ItemsState): boolean {
    return isReady(state) && state.delete.kind === "deleting";
}

export function deleteError(state: ItemsState): string | undefined {
    return isReady(state) && state.delete.kind === "error" ? state.delete.error : undefined;
}

export function selectedItems(state: ItemsState) {
    return isReady(state) ? state.items.filter(item => item.selected) : [];
}

export function selectedItemIds(state: ItemsState) {
    return selectedItems(state).map(item => item.id);
}

export function deleteState(state: ItemsState) {
    return state.status === "ready" ? state.delete : null;
}

export function canUndoDelete(state: ItemsState): boolean {
    return state.status === "ready" && (state.delete.kind === "deleting" || state.delete.kind === "error");
}

export function canRetryDelete(state: ItemsState): boolean {
    return state.status === "ready" && state.delete.kind === "error";
}

export function deleteCount(state: ItemsState): number {
    return state.status === "ready" && (state.delete.kind === "deleting" || state.delete.kind === "error")
    ? state.delete.snapshot.length
    : 0;
}