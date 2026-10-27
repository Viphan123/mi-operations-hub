import { authenticateAccessRequest, requireEditor, requireSameOrigin } from "@/lib/server/access";
import { errorResponse, jsonResponse, readJsonRequest } from "@/lib/server/api-response";
import { getD1Database, seedIfEmpty, validateDeliverable } from "@/lib/server/deliverables";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  try {
    const user = await authenticateAccessRequest(request.headers);
    requireEditor(user);
    requireSameOrigin(request);
    const { id } = await context.params;
    const db = getD1Database(user.env);
    await seedIfEmpty(db, true);

    const item = validateDeliverable(await readJsonRequest(request), id);
    if (!item) return jsonResponse({ error: "The deliverable data is invalid." }, 400);
    const result = await db.prepare("UPDATE deliverables SET payload = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?")
      .bind(JSON.stringify(item), id)
      .run();
    if (!result.meta.changes) return jsonResponse({ error: "Deliverable not found." }, 404);
    return jsonResponse({ item });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  try {
    const user = await authenticateAccessRequest(request.headers);
    requireEditor(user);
    requireSameOrigin(request);
    const { id } = await context.params;
    if (!/^[a-z0-9][a-z0-9-]{0,99}$/.test(id)) return jsonResponse({ error: "Invalid deliverable ID." }, 400);

    const db = getD1Database(user.env);
    await seedIfEmpty(db, true);
    const result = await db.prepare("DELETE FROM deliverables WHERE id = ?").bind(id).run();
    if (!result.meta.changes) return jsonResponse({ error: "Deliverable not found." }, 404);
    return jsonResponse({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
