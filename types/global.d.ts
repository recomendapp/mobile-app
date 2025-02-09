import type { Database as ExtendedDatabase } from '@/types/type.db.extended';

declare global {
  type Database = ExtendedDatabase;
}
