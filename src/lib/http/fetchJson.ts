export type ApiError = {
    kind: "api_error";
    status: number;
    message: string;
    details?: unknown;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function readErrorMessage(body: unknown): string | undefined {
    if (!isRecord(body)) return undefined;

    const error = body["error"];
    if (typeof error === "string") return error;

    const message = body["message"];
    if (typeof message === "string") return message;

    return undefined;
}

export async function fetchJson<T>(
    input: RequestInfo | URL,
    init: RequestInit = {}
): Promise<T> {
    const res = await fetch(input, {
        ...init,
        headers: {
            "Content-Type": "application/json",
            ...(init.headers ?? {})
        }
    });

    if (res.status === 204) {
        return undefined as T;
    }

    const conetentType = res.headers.get("content-type") ?? "";
    const isJson = conetentType.includes("application/json");

    const body: unknown = isJson
        ? await res.json().catch(() => undefined)
        : await res.text().catch(() => undefined);

    if (!res.ok) {
        const message =
            readErrorMessage(body) ??
            (typeof body === "string" && body.trim() ? body : res.statusText) ??
            "Request failed";

        const err: ApiError = {
            kind: "api_error",
            status: res.status,
            message,
            details: body
        };

        throw err;
    }

    return body as T;
}