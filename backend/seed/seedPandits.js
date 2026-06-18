require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');

const User = require('../models/User');
const Pandit = require('../models/Pandit');
const Ritual = require('../models/Ritual');
const Availability = require('../models/Availability');

const {
  FIRST_NAMES,
  LAST_NAMES,
  CITIES,
  LANGUAGES,
  EXPERIENCE_LEVELS,
  generateBio
} = require('./panditsData');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pujaconnect';

const TIME_SLOTS_POOL = [
  '06:00 AM', '08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'
];

// Seed 500 Pandits
const seedPandits = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Fetch existing rituals
    const rituals = await Ritual.find({ isActive: true });
    if (rituals.length === 0) {
      throw new Error('No rituals found in the database. Please run npm run seed first to populate rituals.');
    }
    console.log(`ℹ️  Found ${rituals.length} active rituals to assign.`);

    // 2. Clear existing Pandit data
    console.log('🗑️  Clearing existing Pandit users, profiles, and availability...');
    
    // Clear all users with role 'pandit'
    const deletedUsers = await User.deleteMany({ role: 'pandit' });
    console.log(`🗑️  Deleted ${deletedUsers.deletedCount} existing Pandit user accounts.`);

    // Clear all Pandit profiles
    const deletedPandits = await Pandit.deleteMany({});
    console.log(`🗑️  Deleted ${deletedPandits.deletedCount} existing Pandit profiles.`);

    // Clear all availability slots
    const deletedAvailability = await Availability.deleteMany({});
    console.log(`🗑️  Deleted ${deletedAvailability.deletedCount} availability calendars.`);

    // 3. Setup stats tracking
    const stats = {
      total: 500,
      verified: 0,
      pending: 0,
      rejected: 0,
      cities: new Set(),
      languages: new Set(),
      ritualsAssigned: 0
    };

    console.log('🌱 Generating 500 Pandit records. This might take a few moments...');

    // We process pandits in batches to avoid overwhelming connections
    const batchSize = 25;
    for (let i = 1; i <= stats.total; i++) {
      // Formulate unique name
      let firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      let lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      // Prevent duplicates by attaching index if necessary (or just let it be random)
      const displayName = `Pandit ${firstName} ${lastName}`;

      // Sequentially assign city for even distribution
      const cityInfo = CITIES[i % CITIES.length];
      stats.cities.add(cityInfo.city);

      // Create linked User account
      const user = await User.create({
        name: displayName,
        email: `pandit${String(i).padStart(3, '0')}@pujaconnect.com`,
        password: 'Pandit@123',
        role: 'pandit',
        phone: `98450${String(i).padStart(5, '0')}`,
        city: cityInfo.city,
        region: cityInfo.region
      });

      // Specialization selection
      const specialties = [
        { name: 'Shiva & Homa Specialist', keywords: ['Shiva', 'Rudra', 'Mrityunjaya', 'Havan', 'Homa'] },
        { name: 'Marriage & Family Specialist', keywords: ['Marriage', 'Wedding', 'Vivah', 'Family', 'Griha'] },
        { name: 'Vedic & General Puja Specialist', keywords: ['Satyanarayan', 'Ganesh', 'Lakshmi', 'Vedic', 'Katha'] }
      ];
      const specialty = specialties[(i - 1) % specialties.length];

      // Filter rituals for this specialty
      let filteredRituals = rituals.filter(r => 
        specialty.keywords.some(keyword => 
          r.pujaName.toLowerCase().includes(keyword.toLowerCase()) || 
          r.category.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (filteredRituals.length < 3) {
        filteredRituals = rituals; // Fallback to all if specialty has too few
      }

      // Pick 3-6 random rituals
      const numRituals = Math.min(filteredRituals.length, 3 + Math.floor(Math.random() * 4));
      const selectedRituals = [];
      const tempRituals = [...filteredRituals];
      for (let j = 0; j < numRituals; j++) {
        const idx = Math.floor(Math.random() * tempRituals.length);
        selectedRituals.push(tempRituals[idx]);
        tempRituals.splice(idx, 1);
      }
      stats.ritualsAssigned += selectedRituals.length;

      // Build pricing map
      const pricingMap = new Map();
      selectedRituals.forEach(r => {
        const min = r.priceRange.min || 1000;
        const max = r.priceRange.max || 8000;
        const price = Math.round((min + Math.random() * (max - min)) / 100) * 100;
        pricingMap.set(r._id.toString(), price);
      });

      // Determine regional language affinity
      const selectedLanguages = [];
      // Sanskrit (80% chance) and Hindi (65% chance)
      if (Math.random() < 0.8) selectedLanguages.push('Sanskrit');
      if (Math.random() < 0.65) selectedLanguages.push('Hindi');

      // State specific regional languages
      if (cityInfo.state === 'Karnataka' && !selectedLanguages.includes('Kannada')) selectedLanguages.push('Kannada');
      if (cityInfo.state === 'Maharashtra' && !selectedLanguages.includes('Marathi')) selectedLanguages.push('Marathi');
      if (cityInfo.state === 'Tamil Nadu' && !selectedLanguages.includes('Tamil')) selectedLanguages.push('Tamil');
      if (cityInfo.state === 'Telangana' && !selectedLanguages.includes('Telugu')) selectedLanguages.push('Telugu');
      if (cityInfo.state === 'Kerala' && !selectedLanguages.includes('Malayalam')) selectedLanguages.push('Malayalam');
      if (cityInfo.state === 'West Bengal' && !selectedLanguages.includes('Bengali')) selectedLanguages.push('Bengali');
      if (cityInfo.state === 'Gujarat' && !selectedLanguages.includes('Gujarati')) selectedLanguages.push('Gujarati');

      // Add a random fallback language if empty
      if (selectedLanguages.length === 0) {
        selectedLanguages.push(LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)]);
      }

      // Cap languages list and add to stats
      const finalLanguages = selectedLanguages.slice(0, 4);
      finalLanguages.forEach(l => stats.languages.add(l));

      // Experience level
      const experience = EXPERIENCE_LEVELS[Math.floor(Math.random() * EXPERIENCE_LEVELS.length)];

      // Verification Status distribution: 80% verified, 15% pending, 5% rejected
      let status = 'verified';
      if (i > 400 && i <= 475) {
        status = 'pending';
      } else if (i > 475) {
        status = 'rejected';
      }

      if (status === 'verified') stats.verified++;
      else if (status === 'pending') stats.pending++;
      else if (status === 'rejected') stats.rejected++;

      // Create Pandit Profile
      const pandit = await Pandit.create({
        userId: user._id,
        photo: '',
        bio: generateBio(displayName, experience, cityInfo.city, specialty.name),
        location: {
          city: cityInfo.city,
          region: cityInfo.region,
          state: cityInfo.state
        },
        yearsOfExperience: experience,
        supportedRituals: selectedRituals.map(r => r._id),
        languagesSpoken: finalLanguages,
        pricing: pricingMap,
        verificationStatus: status,
        verificationNote: status === 'rejected' ? 'Missing required certification document.' : '',
        isActive: true
      });

      // Generate Availability schedules for the next 30 days
      const availabilityDocs = [];
      for (let day = 0; day < 30; day++) {
        // 80% chance of being available on any given day
        if (Math.random() < 0.8) {
          const date = new Date();
          date.setDate(date.getDate() + day);
          date.setHours(0, 0, 0, 0); // Normalize to start of day

          // Pick 3-6 random slots
          const numSlots = 3 + Math.floor(Math.random() * 4);
          const timeSlots = [];
          const tempSlots = [...TIME_SLOTS_POOL];
          for (let s = 0; s < numSlots; s++) {
            const idx = Math.floor(Math.random() * tempSlots.length);
            const timeStr = tempSlots[idx];
            tempSlots.splice(idx, 1);

            // 25% chance slot is booked
            timeSlots.push({
              time: timeStr,
              isBooked: Math.random() < 0.25,
              bookingId: null
            });
          }

          availabilityDocs.push({
            pandit: pandit._id,
            date,
            timeSlots,
            status: 'available'
          });
        }
      }

      if (availabilityDocs.length > 0) {
        await Availability.insertMany(availabilityDocs);
      }

      if (i % 50 === 0) {
        console.log(`👉 Created ${i}/500 Pandits...`);
      }
    }

    // ── Seeding Report Printout ──
    console.log('\n🎉 Pandit Dataset Seeded Successfully!');
    console.log('─────────────────────────────────');
    console.log(`Total Pandits Created: ${stats.total}`);
    console.log(`Verified:              ${stats.verified}`);
    console.log(`Pending:               ${stats.pending}`);
    console.log(`Rejected:              ${stats.rejected}`);
    console.log('─────────────────────────────────');
    console.log(`Cities Covered:        ${stats.cities.size} (${Array.from(stats.cities).join(', ')})`);
    console.log(`Languages Covered:     ${stats.languages.size} (${Array.from(stats.languages).join(', ')})`);
    console.log(`Rituals Assigned:      ${stats.ritualsAssigned}`);
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedPandits();
