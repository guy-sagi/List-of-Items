import { Router } from "express";

type Item = {
    id: string;
    title: string;
};

const router = Router();

let items: Item[] = [
    { id: "1", title: "First" },
    { id: "2", title: "Second" }
];

router.get("/", (req, res) => {
    res.json(items);
});

router.post("/", (req, res) => {
    const { title } = req.body as { title?: string };

    if (!title || typeof title !== "string") {
        res.status(400).json({ error: "title is required" });
        return;
    }

    const item: Item = {
        id: crypto.randomUUID(),
        title
    };

    items.push(item);

    res.status(201).json(item);
});

router.delete("/", (req, res) => {
    const { ids } = req.body as { ids?: string[] };

    if (!Array.isArray(ids)) {
        res.status(400).json({ error: "ids must be an array" });
        return;
    }

    items = items.filter(item => !ids.includes(item.id));

    res.status(204).send();
})

export default router;