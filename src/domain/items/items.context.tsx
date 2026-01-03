import { createContext, useContext, useReducer, ReactNode, useMemo } from "react";
import { ItemsState } from "./items.types";
import { listReducer } from "./items.reducer"
import { createHttpItemsRepository } from "./items.repository.http";
import { createItemsEffects } from "./items.effects";
import { createInMemoryItemsRepository } from "./items.repository.memory";

export type ItemsContextValue = {
    state: ItemsState;
    effects: ReturnType<typeof createItemsEffects>;
}

const ItemsContext = createContext<ItemsContextValue | undefined>(undefined)
const repoType = import.meta.env.VITE_DATA_SOURCE ?? "in_memory";
const repo = repoType === "in_memory" ? createInMemoryItemsRepository() : createHttpItemsRepository();

export function ItemsProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(listReducer, { status: "idle", items: [] });

    const effects = useMemo(
        () => createItemsEffects(repo, dispatch),
        [dispatch]
    );

    return (
        <ItemsContext.Provider value={{ state, effects }}>
            {children}
        </ItemsContext.Provider>
    )
}

export function useItems(): ItemsContextValue {
    const ctx = useContext(ItemsContext);

    if (!ctx) {
        throw new Error("useItems must be used within ItemsProvider");
    }

    return ctx;
}