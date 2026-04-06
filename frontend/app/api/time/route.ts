import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET() {
    // Always return the current server time in UTC ISO format
    // The client will convert this to the target timezone (Asia/Jakarta)
    return NextResponse.json({
        iso: new Date().toISOString()
    });
}
