import { ItemsProvider } from "../domain/items/items.context";
import { ItemsPage } from "../ui/items/ItemsPage";

export function App() {
    return (
        <ItemsProvider>
            <ItemsPage />
        </ItemsProvider>
    )
}