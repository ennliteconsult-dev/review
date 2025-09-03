import { PrismaClient } from '@prisma/client';

// PrismaClient is instantiated once per application
const prisma = new PrismaClient();

export default prisma;