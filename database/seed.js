// Import Sequelize connection and all registered models.
// Allows us to interact with the database and create sample records.
const { sequelize, User, Service, IpRecord } = require('./models');

async function seed() {
  try {
    console.log('Resetting database...');

    // Drops and recreates all tables.
    // This ensures that every seed run starts from a clean state.
    await sequelize.sync({ force: true });

    // -------------------------
    // Create Sample Users
    // -------------------------
    console.log('Creating sample users...');

    // Admin user with full system control
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin'
    });

    // Security Engineer responsible for IP management
    const secEng = await User.create({
      name: 'Security Engineer',
      email: 'seceng@example.com',
      role: 'sec'
    });

    // Client application representing automated system access
    const client = await User.create({
      name: 'Client App',
      email: 'client@example.com',
      role: 'client'
    });

    // -------------------------
    // Create Sample Services
    // -------------------------
    console.log('Creating sample services...');

    // Represents an internal dashboard tool staff members may access
    const dashboard = await Service.create({
      name: 'Internal Dashboard',
      description: 'Main internal dashboard for staff.'
    });

    // Represents a reporting/analytics system
    const reportsTool = await Service.create({
      name: 'Reports Tool',
      description: 'Internal reporting analytics.'
    });

    // -------------------------
    // Create Sample IP Records
    // -------------------------
    console.log('Creating sample IP records...');

    // Maps a Security Engineer to an approved office network IP for the dashboard
    await IpRecord.create({
      ipAddress: '203.0.113.10',
      label: 'Office Network',
      userId: secEng.id,
      serviceId: dashboard.id
    });

    // Maps the Admin to a VPN node used for analytics access
    await IpRecord.create({
      ipAddress: '198.51.100.5',
      label: 'VPN Exit Node',
      userId: admin.id,
      serviceId: reportsTool.id
    });

    // Maps the Client app to a development machine IP for dashboard access
    await IpRecord.create({
      ipAddress: '192.168.1.25',
      label: 'Home Dev Machine',
      userId: client.id,
      serviceId: dashboard.id
    });

    console.log('Seeding complete.');
  } catch (error) {
    // Logs any unexpected seeding issues for debugging
    console.error('Seed error:', error);
  } finally {
    // Close DB connection and end the script cleanly
    await sequelize.close();
    process.exit(0);
  }
}

// Execute the seed function immediately
seed();