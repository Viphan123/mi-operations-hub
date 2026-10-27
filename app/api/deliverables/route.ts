import { authenticateAccessRequest, canEditWorkspace, requireEditor, requireSameOrigin } from "@/lib/server/access";
import { errorResponse, jsonResponse, readJsonRequest } from "@/lib/server/api-response";
import { getD1Database, listDeliverables, seedIfEmpty, validateDeliverable } from "@/lib/server/deliverables";

export async function GET(request: Request) {
  try {
    const user = await authenticateAccessRequest(request.headers);
    const db = getD1Database(user.env);
    const canEdit = canEditWorkspace(user);
    const initialized = await seedIfEmpty(db, canEdit);
    if (!initialized) return jsonResponse({ error: "An authorized editor must initialize the shared workspace." }, 503);
    return jsonResponse({ items: await listDeliverables(db), canEdit });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await authenticateAccessRequest(request.headers);
    requireEditor(user);
    requireSameOrigin(request);
    const db = getD1Database(user.env);
    await seedIfEmpty(db, true);

    const item = validateDeliverable(await readJsonRequest(request));
    if (!item) return jsonResponse({ error: "The deliverable data is invalid." }, 400);
    const result = await db.prepare("INSERT OR IGNORE INTO deliverables (id, payload) VALUES (?, ?)")
      .bind(item.id, JSON.stringify(item))
      .run();
    if (!result.meta.changes) return jsonResponse({ error: "A deliverable with that ID already exists." }, 409);
    return jsonResponse({ item }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
