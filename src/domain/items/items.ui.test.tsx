import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect } from "vitest";
import { ItemsList } from "../../ui/items/ItemsList";

it("renders empty state when there are no items", () => {
    render(
        <ItemsList
            items={[]}
            onChecked={() => { }}
            disabled={false}
        />
    );

    expect(screen.getByText(/no items/i)).toBeInTheDocument();
});

describe("ItemsList", () => {
    it("renders items with correct checked state", () => {
        render(
            <ItemsList
                items={[
                    { id: "1", title: "Item A", selected: true },
                    { id: "2", title: "Item B", selected: false }
                ]}
                onChecked={() => { }}
                disabled={false}
            />
        );

        expect(screen.getByText(/item a/i)).toBeInTheDocument();
        expect(screen.getByText(/item b/i)).toBeInTheDocument();

        const checkboxes = screen.getAllByRole("checkbox");

        expect(checkboxes).toHaveLength(2);
        expect(screen.getByRole("checkbox", { name: /item a/i })).toBeChecked();
        expect(screen.getByRole("checkbox", { name: /item b/i })).not.toBeChecked();
    });

    it("checkbox is accessible via item title label", () => {
        render(
            <ItemsList
                items={[
                    { id: "1", title: "Item A", selected: true }
                ]}
                onChecked={() => { }}
                disabled={false}
            />
        );

        screen.getByRole("checkbox", { name: /item a/i });
    });

    it("calls onChecked with (id, checked) when user toggles a checkbox", async () => {
        const user = userEvent.setup();
        const onChecked = vi.fn();

        render(
            <ItemsList
                items={[
                    { id: "1", title: "Item A", selected: true },
                    { id: "2", title: "Item B", selected: false }
                ]}
                onChecked={onChecked}
                disabled={false}
            />
        );

        // user unchecks checkbox of Item A
        const checkbox1 = screen.getByRole("checkbox", { name: /item a/i });

        await user.click(checkbox1);

        expect(onChecked).toHaveBeenCalledTimes(1);
        expect(onChecked).toHaveBeenCalledWith("1", false);


        // user checks checkbox of Item B
        const checkbox2 = screen.getByRole("checkbox", { name: /item b/i });

        await user.click(checkbox2);

        expect(onChecked).toHaveBeenCalledTimes(2);
        expect(onChecked).toHaveBeenCalledWith("2", true);
    });

    it("onChecked is not called when user clicks disabled checkbox", async () => {
        const user = userEvent.setup();
        const onChecked = vi.fn();

        render(
            <ItemsList
                items={[
                    { id: "1", title: "Item A", selected: false },
                    { id: "2", title: "Item B", selected: true }
                ]}
                onChecked={onChecked}
                disabled={true}
            />
        );

        // user unchecks checkbox of Item A
        const checkbox1 = screen.getByRole("checkbox", { name: /item a/i });
        const checkbox2 = screen.getByRole("checkbox", { name: /item b/i });

        expect(checkbox1).toBeDisabled();
        expect(checkbox2).toBeDisabled();

        await user.click(checkbox1);
        await user.click(checkbox2);

        expect(onChecked).toBeCalledTimes(0);
    });

    it("no crash when onChecked is no-op", async () => {
        const user = userEvent.setup();

        render(
            <ItemsList
                items={[
                    { id: "1", title: "Item A", selected: false }
                ]}
                onChecked={() => { }}
                disabled={false}
            />
        );

        // user unchecks checkbox of Item A
        const checkbox = screen.getByRole("checkbox", { name: /item a/i });

        await expect(user.click(checkbox)).resolves.not.toThrow();
    });
});