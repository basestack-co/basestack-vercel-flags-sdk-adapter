import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { headerFlag } from "../../flags";

export async function GET(request: NextRequest) {
  const header = await headerFlag();

  return NextResponse.json(
    {
      header,
    },
    {
      headers: {
        "cache-control": "no-store",
      },
    }
  );
}
