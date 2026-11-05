import "server-only";

import { PrismaClient } from "@prisma/client";

// Un solo cliente por proceso: en desarrollo, la recarga en caliente crearía uno nuevo en cada cambio.
const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
