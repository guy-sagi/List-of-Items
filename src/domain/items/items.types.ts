export type Item = {
    id: string;
    title: string;
    selected: boolean;
}

type CreateState =
    | { kind: "idle" }
    | { kind: "creating"; requestId: number }
    | { kind: "error"; error: string };

type DeleteState =
    | { kind: "idle" }
    | { kind: "deleting"; requestId: number; snapshot: Item[] }
    | { kind: "error"; requestId: number; error: string; snapshot: Item[] };

export type ItemsState =
    | { status: "idle"; items: Item[] }
    | { status: "loading"; items: Item[]; requestId: number }
    | {
        status: "ready";
        items: Item[];
        create: CreateState;
        delete: DeleteState;
    }
    | { status: "error"; items: Item[]; error: string };

export type ItemsAction =
    | { type: "LOAD_START"; requestId: number }
    | { type: "LOAD_SUCCESS"; requestId: number; items: Item[] }
    | { type: "LOAD_ERROR"; requestId: number; error: string }
    | { type: "SELECT_ITEM"; id: string; selected: boolean }
    | { type: "CREATE_START"; requestId: number }
    | { type: "CREATE_SUCCESS"; requestId: number; item: Item }
    | { type: "CREATE_ERROR"; requestId: number; error: string }
    | { type: "DELETE_START"; requestId: number }
    | { type: "DELETE_SUCCESS"; requestId: number }
    | { type: "DELETE_ERROR"; requestId: number; error: string }
    | { type: "DELETE_UNDO"; requestId: number }
    | { type: "DELETE_RETRY"; requestId: number }
    | { type: "DELETE_COMMIT"; requestId: number };