require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Ritual = require('../models/Ritual');
const ritualsData = require('./ritualsData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pujaconnect';

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Ritual.deleteMany({});
    console.log('🗑️  Cleared existing rituals');

    // Seed rituals
    const createdRituals = await Ritual.insertMany(ritualsData);
    console.log(`✅ Seeded ${createdRituals.length} rituals`);

    // ── Create admin user (idempotent — only if no admin exists) ──
    const adminEmail = process.env.ADMIN_EMAIL    || 'admin@pujaconnect.com';
    const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@1234';

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      await User.create({
        name:     'PujaConnect Admin',
        email:    adminEmail,
        password: adminPass,
        role:     'admin',
      });
      console.log(`✅ Admin user created: ${adminEmail}`);
    } else {
      console.log('ℹ️  Admin user already exists — skipping creation');
    }

    console.log('\n🎉 Database seeded successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
