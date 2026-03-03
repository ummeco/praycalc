import { NextRequest, NextResponse } from "next/server";
import { searchAutoComplete, lookupGeoByName } from "@/lib/data-lookup";
import { geoRecordToResult } from "@/lib/geo-server";
import type { GeoResult } from "@/lib/geo";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q || q.trim().length < 2) {
    return NextResponse.json([]);
  }

  const autoResults = searchAutoComplete(q.trim());

  const results: GeoResult[] = autoResults
    .map((r) => {
      const geo = lookupGeoByName(r.n);
      return geo ? geoRecordToResult(geo) : null;
    })
    .filter((r): r is GeoResult => r !== null);

  return NextResponse.json(results);
}
