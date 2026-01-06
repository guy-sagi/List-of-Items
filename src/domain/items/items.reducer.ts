import { ItemsState, ItemsAction } from './items.types'

export function listReducer(state: ItemsState, action: ItemsAction): ItemsState {
    switch (action.type) {
        case "LOAD_START": {
            return { status: "loading", items: state.items, requestId: action.requestId };
        }
        case "LOAD_SUCCESS": {
            if (state.status !== "loading") return state;
            if (state.requestId !== action.requestId) return state;

            return { status: "ready", items: action.items, create: { kind: "idle" }, delete: { kind: "idle" } };
        }
        case "LOAD_ERROR": {
            if (state.status !== "loading") return state;
            if (state.requestId !== action.requestId) return state;

            return { status: "error", items: state.items, error: action.error };
        }
        case "SELECT_ITEM": {
            if (state.status !== "ready") return state;

            const idx = state.items.findIndex(item => item.id === action.id);
            if (idx === -1) return state;

            const items = [
                ...state.items.slice(0, idx),
                { ...state.items[idx], selected: action.selected },
                ...state.items.slice(idx + 1)
            ]
            return { ...state, items };
        }
        case "CREATE_START": {
            if (state.status !== "ready") return state;
            if (state.create.kind === "creating") return state;

            return {
                ...state,
                items: state.items,
                create: { kind: "creating", requestId: action.requestId }
            };
        }
        case "CREATE_SUCCESS": {
            if (state.status !== "ready") return state;
            if (state.create.kind !== "creating") return state;
            if (state.create.requestId !== action.requestId) return state;

            return { ...state, items: [...state.items, action.item], create: { kind: "idle" } };
        }
        case "CREATE_ERROR": {
            if (state.status !== "ready") return state;
            if (state.create.kind !== "creating") return state;
            if (state.create.requestId !== action.requestId) return state;

            return { ...state, items: state.items, create: { kind: "error", error: action.error } };
        }
        case "DELETE_START": {
            if (state.status !== "ready") return state;
            if (state.delete.kind === "deleting") return state;

            return {
                ...state,
                items: state.items.filter(item => !item.selected),
                delete: { kind: "deleting", requestId: action.requestId, snapshot: state.items }
            };
        }
        // DELETE_SUCCESS removes all currently selected items
        case "DELETE_SUCCESS": {
            if (state.status !== "ready") return state;
            if (state.delete.kind !== "deleting") return state;
            if (state.delete.requestId !== action.requestId) return state;

            return {
                ...state,
                delete: { kind: "idle" }
            };
        }
        case "DELETE_ERROR": {
            if (state.status !== "ready") return state;
            if (state.delete.kind !== "deleting") return state;
            if (state.delete.requestId !== action.requestId) return state;

            return {
                ...state,
                items: state.delete.snapshot,
                delete: {
                    kind: "error",
                    requestId: action.requestId,
                    error: action.error,
                    snapshot: state.delete.snapshot
                }
            };
        }
        case "DELETE_UNDO": {
            if (state.status !== "ready") return state;
            if (state.delete.kind !== "deleting" && state.delete.kind !== "error") return state;
            if (state.delete.requestId !== action.requestId) return state;

            return {
                ...state,
                items: state.delete.snapshot,
                delete: { kind: "idle" }
            }
        }
        case "DELETE_RETRY": {
            if (state.status !== "ready") return state;
            if (state.delete.kind !== "error") return state;
            if (state.delete.requestId !== action.requestId) return state;

            return {
                ...state,
                delete: {
                    kind: "deleting",
                    requestId: action.requestId,
                    snapshot: state.delete.snapshot,
                },
            };
        }
        case "DELETE_COMMIT": {
            if (state.status !== "ready") return state;
            if (state.delete.kind !== "deleting") return state;
            if (state.delete.requestId !== action.requestId) return state;

            return {
                ...state,
                delete: { kind: "idle" }
            };
        }
        default: {
            const _exhaustive: never = action;
            return state;
        }
    }
}