import { createContext, useContext, useReducer, ReactNode, useMemo } from "react";
import { ItemsState } from "./items.types";
import { listReducer } from "./items.reducer"
import { inMemoryItemsRepository } from "./items.repository.memory";
import { createItemsEffects } from "./items.effects";

export type ItemsContextValue = {
    state: ItemsState;
    effects: ReturnType<typeof createItemsEffects>;
}

const ItemsContext = createContext<ItemsContextValue | undefined>(undefined)

export function ItemsProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(listReducer, { status: "idle", items: [] });

    const effects = useMemo(
        () => createItemsEffects(inMemoryItemsRepository, dispatch),
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