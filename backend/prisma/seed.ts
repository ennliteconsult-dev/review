import { PrismaClient, ApprovalStatus, Role } from '@prisma/client';
import { servicesToSeed } from './seedData';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // Clear existing data in the correct order to avoid foreign key constraints
    await prisma.review.deleteMany();
    await prisma.service.deleteMany();
    console.log('Deleted records in service and review tables');
    await prisma.user.deleteMany();
    console.log('Deleted records in user table');
    
    // Create a sample users
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    const providerUser = await prisma.user.create({
        data: {
            email: 'provider@example.com',
            name: 'John Doe Services',
            password: hashedPassword,
            role: Role.PROVIDER,
        },
    });
    console.log(`Created provider user: '${providerUser.name}'`);

    const adminUser = await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword, // Using the same hashed password for simplicity
            role: Role.ADMIN,
        },
    });
    console.log(`Created admin user: '${adminUser.name}'`);

    // Create services and link them to the provider user
    const servicesData = servicesToSeed.map(service => ({
        ...service,
        providerId: providerUser.id, // This now correctly references the user created above
        approvalStatus: ApprovalStatus.APPROVED,
    }));

    await prisma.service.createMany({
        data: servicesData,
    });
    console.log(`Created ${servicesToSeed.length} services for user '${providerUser.name}'.`);
    
    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });