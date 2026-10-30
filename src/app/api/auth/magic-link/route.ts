/** TODO: implement the reviewed magic-link contract; no external effects. */
export async function POST() {
  return Response.json(
    { error: "not_implemented" },
    { status: 501, headers: { "Cache-Control": "no-store" } },
  );
}
