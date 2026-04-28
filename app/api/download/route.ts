import { NextRequest, NextResponse } from "next/server";

const sanitizeFileName = (fileName: string) => {
  return fileName.replace(/[\\/:*?"<>|]/g, "_");
};

export const GET = async (request: NextRequest) => {
  const sourceUrl = request.nextUrl.searchParams.get("url");
  const requestedName = request.nextUrl.searchParams.get("name");

  if (!sourceUrl) {
    return NextResponse.json({ error: "Missing file url" }, { status: 400 });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(sourceUrl);
  } catch {
    return NextResponse.json({ error: "Invalid file url" }, { status: 400 });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return NextResponse.json({ error: "Unsupported url protocol" }, { status: 400 });
  }

  try {
    const upstream = await fetch(parsedUrl.toString(), { method: "GET" });

    if (!upstream.ok) {
      return NextResponse.json({ error: "Failed to fetch file" }, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type") || "application/octet-stream";
    const defaultName = parsedUrl.pathname.split("/").pop() || "download";
    const finalName = sanitizeFileName(requestedName || defaultName);

    return new NextResponse(upstream.body, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${finalName}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ error: "Server download error" }, { status: 500 });
  }
};
