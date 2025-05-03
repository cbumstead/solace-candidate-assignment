import { sql } from "drizzle-orm";
import {
  pgTable,
  integer,
  text,
  jsonb,
  serial,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/pg-core";

export type Advocate = {
  id: number;
  firstName: string;
  lastName: string;
  city: string;
  degree: string;
  specialties: string[];
  yearsOfExperience: number;
  phoneNumber: string;
  createdAt: Date;
};

const advocates = pgTable("advocates", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  city: text("city").notNull(),
  degree: text("degree").notNull(),
  specialties: jsonb("specialties").$type<string[]>().default([]).notNull(),
  yearsOfExperience: integer("years_of_experience").notNull(),
  phoneNumber: varchar("phone_number", { length: 15 }).notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
}, (table) => ({
  nameIdx: index("name_idx").on(table.firstName, table.lastName),
  cityIdx: index("city_idx").on(table.city),
  specialtiesIdx: index("specialties_idx").on(table.specialties),
  fullTextIdx: index("full_text_idx").on(sql`to_tsvector('english', ${table.firstName} || ' ' || ${table.lastName} || ' ' || ${table.city} || ' ' || ${table.degree})`),
}));

export { advocates };
