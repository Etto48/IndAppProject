// app/api/premium.tsx (Next.js 13+)
import { NextRequest } from "next/server";

export const runtime = "edge";

const premiumApiUrl = process.env.PREMIUM_URL || "http://localhost:5432";

export default async function handler(req: NextRequest): Promise<Response> {
    if (req.method !== "GET") {
        return new Response("Method Not Allowed", {
            status: 405,
            headers: {
                "Allow": "GET",
                "Content-Type": "application/json",
            },
        });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
        return new Response("Bad Request: No ID provided", {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    try {
        const res = await fetch(`${premiumApiUrl}/premium?id=${id}`);
        if (!res.ok) {
            throw new Error("Error contacting premium API");
        }

        const data = await res.json(); // es: { id: "...", tier: 0 }
        return new Response(JSON.stringify(data), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error("Error calling premium API:", err);
        return new Response("Internal Server Error", {
            status: 500,
            headers: { "Content-Type": "text/plain" },
        });
    }
}
