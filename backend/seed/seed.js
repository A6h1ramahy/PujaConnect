require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Ritual = require('../models/Ritual');
const Pandit = require('../models/Pandit');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pujaconnect';

const rituals = [
  {
    pujaName: 'Satyanarayan Katha',
    description: 'A sacred ritual dedicated to Lord Vishnu, performed for blessings of prosperity, happiness, and fulfillment of wishes. Involves recitation of the Satyanarayan Katha story and Puja rituals.',
    duration: '3-4 hours',
    requiredMaterials: ['Panchamrit', 'Flowers', 'Incense sticks', 'Fruits', 'Coconut', 'Wheat flour', 'Sugar', 'Ghee', 'Banana leaves', 'Yellow cloth'],
    priceRange: { min: 2100, max: 5100 },
    locationType: 'Both',
  },
  {
    pujaName: 'Naamkaran',
    description: 'The sacred Hindu naming ceremony for a newborn baby, performed on the 11th or 12th day after birth. The ritual includes prayers, horoscope preparation, and official naming.',
    duration: '2-3 hours',
    requiredMaterials: ['Mango leaves', 'Flowers', 'Incense', 'Coconut', 'Honey', 'Ghee', 'Sacred thread', 'New clothes for baby'],
    priceRange: { min: 1500, max: 3500 },
    locationType: 'Home',
  },
  {
    pujaName: 'Griha Pravesh',
    description: 'A housewarming ceremony performed before entering a new home for the first time. The ritual purifies the house, invites positive energies, and seeks blessings for the family.',
    duration: '3-5 hours',
    requiredMaterials: ['Kalash', 'Mango leaves', 'Cow dung', 'Flowers', 'Kumkum', 'Turmeric', 'Rice', 'Coconut', 'Ghee', 'Wood for havan'],
    priceRange: { min: 3100, max: 7500 },
    locationType: 'Home',
  },
  {
    pujaName: 'Havan / Homam',
    description: 'A sacred fire ritual (Yajna) performed to invoke divine blessings. Involves chanting of Vedic mantras while offerings are made into the sacred fire.',
    duration: '2-4 hours',
    requiredMaterials: ['Havan Kund', 'Wood (mango/peepal)', 'Ghee', 'Samagri', 'Sesame seeds', 'Barley', 'Flowers', 'Camphor'],
    priceRange: { min: 2500, max: 8000 },
    locationType: 'Both',
  },
  {
    pujaName: 'Mundan Ceremony',
    description: 'The first tonsure ritual for a child, performed between 1-3 years of age. The ritual symbolizes the removal of past karma and welcoming new positive energies.',
    duration: '1-2 hours',
    requiredMaterials: ['Coconut', 'Flowers', 'Yellow thread', 'Turmeric', 'Barber\'s tools', 'Ghee', 'Honey'],
    priceRange: { min: 1100, max: 2500 },
    locationType: 'Both',
  },
  {
    pujaName: 'Ganesh Puja',
    description: 'An auspicious puja dedicated to Lord Ganesha, the remover of obstacles. Performed before starting any new venture, business, or important life event.',
    duration: '1-2 hours',
    requiredMaterials: ['Ganesha idol', 'Red flowers', 'Modak', 'Durva grass', 'Coconut', 'Incense', 'Camphor', 'Red thread'],
    priceRange: { min: 1100, max: 3100 },
    locationType: 'Both',
  },
  {
    pujaName: 'Lakshmi Puja',
    description: 'A puja dedicated to Goddess Lakshmi for wealth, prosperity, and abundance. Commonly performed on Diwali, Fridays, or for new business openings.',
    duration: '1-2 hours',
    requiredMaterials: ['Lotus flowers', 'Coins', 'Kumkum', 'Turmeric', 'Rice', 'Coconut', 'Incense', 'Gold/silver items'],
    priceRange: { min: 1500, max: 4000 },
    locationType: 'Both',
  },
  {
    pujaName: 'Vivah (Wedding Ceremony)',
    description: 'A traditional Hindu wedding ceremony with full Vedic rituals including Saptapadi (seven vows), Kanyadaan, and Mangalsutra ceremony.',
    duration: '4-6 hours',
    requiredMaterials: ['Mandap', 'Sacred fire wood', 'Flowers', 'Garlands', 'Coconut', 'Betel leaves', 'Turmeric', 'Kumkum', 'Wedding thread', 'Ghee'],
    priceRange: { min: 11000, max: 51000 },
    locationType: 'Both',
  },
];

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data (be careful in production!)
    await Ritual.deleteMany({});
    console.log('🗑️  Cleared existing rituals');

    // Seed rituals
    const createdRituals = await Ritual.insertMany(rituals);
    console.log(`✅ Seeded ${createdRituals.length} rituals`);

    // ── Create admin user (idempotent — only if no admin exists) ──
    // Credentials read from environment variables; defaults are for local dev ONLY.
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
    console.log('Admin credentials (check your .env or defaults):');
    console.log(`  Email:    ${adminEmail}`);
    console.log('  Password: [set via ADMIN_PASSWORD env var]');
    console.log('\n⚠️  Change the admin password after first login!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seed();
