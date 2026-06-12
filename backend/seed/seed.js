require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Ritual = require('../models/Ritual');
const ritualsData = require('./ritualsData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pujaconnect';

const seed = async () => {
  try {
    // ── Seeder Security Enforcement ──
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPass  = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPass) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required to seed the database.");
    }

    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Ritual.deleteMany({});
    console.log('🗑️  Cleared existing rituals');

    // Seed rituals
    const createdRituals = await Ritual.insertMany(ritualsData);
    console.log(`✅ Seeded ${createdRituals.length} rituals`);

    // ── Create admin user (idempotent) ──
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

    // ── Seed Verification Report ──
    const totalRituals = createdRituals.length;
    const categoriesSet = new Set(createdRituals.map(r => r.category));
    const featuredCount = createdRituals.filter(r => r.featured).length;
    const popularCount = createdRituals.filter(r => r.popular).length;
    const activeCount = createdRituals.filter(r => r.isActive).length;

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log(`Total Rituals:      ${totalRituals}`);
    console.log(`Total Categories:  ${categoriesSet.size}`);
    console.log(`Featured Rituals:  ${featuredCount}`);
    console.log(`Popular Rituals:   ${popularCount}`);
    console.log(`Active Rituals:    ${activeCount}`);
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
