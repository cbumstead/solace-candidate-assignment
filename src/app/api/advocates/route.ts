import db from "../../../db";
import { advocates } from "../../../db/schema";
import { sql } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const searchQuery = searchParams.get('q') || '';
  const specialty = searchParams.get('specialty') || '';
  const offset = (page - 1) * limit;

  let query = db.select().from(advocates);

  if (searchQuery) {
    query = query.where(
      sql`to_tsvector('english', first_name || ' ' || last_name || ' ' || city || ' ' || degree) @@ to_tsquery('english', ${searchQuery})`
    );
  }

  if (specialty) {
    query = query.where(sql`${specialty} = ANY(specialties)`);
  }

  const [data, total] = await Promise.all([
    query.limit(limit).offset(offset),
    query.count()
  ]);

  return Response.json({
    data,
    pagination: {
      total: total[0].count,
      page,
      limit,
      totalPages: Math.ceil(total[0].count / limit)
    }
  });
}
