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

const seedPandits = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // 1. Fetch active rituals
    const rituals = await Ritual.find({ isActive: true });
    if (rituals.length === 0) {
      throw new Error('No rituals found in the database. Please run npm run seed first to populate rituals.');
    }
    console.log(`ℹ️  Found ${rituals.length} active rituals to assign.`);

    // 2. Clear existing Pandit data & Availability
    console.log('🗑️  Clearing existing Pandit users, profiles, and availability...');
    
    // Clear all users with role 'pandit'
    const deletedUsers = await User.deleteMany({ role: 'pandit' });
    console.log(`🗑️  Deleted ${deletedUsers.deletedCount} existing Pandit user accounts.`);

    // Clear all Pandit profiles
    const deletedPandits = await Pandit.deleteMany({});
    console.log(`🗑️  Deleted ${deletedPandits.deletedCount} existing Pandit profiles.`);

    // Clear all availability slots (ensure completely empty as requested)
    const deletedAvailability = await Availability.deleteMany({});
    console.log(`🗑️  Deleted ${deletedAvailability.deletedCount} availability calendars.`);

    // 3. Setup stats tracking
    const stats = {
      total: 515,
      verified: 0,
      pending: 0,
      rejected: 0,
      cities: new Set(),
      languages: new Set(),
      ritualsAssigned: 0,
      ritualCoverage: {} // ritualId -> count of verified pandits
    };

    // Initialize ritual coverage counter
    rituals.forEach(r => {
      stats.ritualCoverage[r._id.toString()] = {
        name: r.pujaName,
        verifiedCount: 0
      };
    });

    console.log('🌱 Generating 515 Pandit records. This might take a few moments...');

    for (let i = 1; i <= stats.total; i++) {
      // Pick unique-ish name
      const firstName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lastName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
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
        region: cityInfo.state
      });

      // Verification Status distribution: 450 verified, 50 pending, 15 rejected
      let status = 'verified';
      if (i > 450 && i <= 500) {
        status = 'pending';
      } else if (i > 500) {
        status = 'rejected';
      }

      if (status === 'verified') stats.verified++;
      else if (status === 'pending') stats.pending++;
      else if (status === 'rejected') stats.rejected++;

      // Determine experience level randomly
      const expPool = [2, 5, 8, 12, 20, 30];
      const experience = expPool[Math.floor(Math.random() * expPool.length)];

      // Determine languages: 1 to 4 languages
      const selectedLanguages = [];
      // Always add Sanskrit (80% chance) and Hindi (70% chance)
      if (Math.random() < 0.8) selectedLanguages.push('Sanskrit');
      if (Math.random() < 0.7) selectedLanguages.push('Hindi');

      // Add regional state language
      if (cityInfo.state === 'Karnataka' && !selectedLanguages.includes('Kannada')) selectedLanguages.push('Kannada');
      if (cityInfo.state === 'Maharashtra' && !selectedLanguages.includes('Marathi')) selectedLanguages.push('Marathi');
      if (cityInfo.state === 'Tamil Nadu' && !selectedLanguages.includes('Tamil')) selectedLanguages.push('Tamil');
      if (cityInfo.state === 'Telangana' && !selectedLanguages.includes('Telugu')) selectedLanguages.push('Telugu');
      if (cityInfo.state === 'Kerala' && !selectedLanguages.includes('Malayalam')) selectedLanguages.push('Malayalam');
      if (cityInfo.state === 'West Bengal' && !selectedLanguages.includes('Bengali')) selectedLanguages.push('Bengali');
      if (cityInfo.state === 'Gujarat' && !selectedLanguages.includes('Gujarati')) selectedLanguages.push('Gujarati');

      // Add some random extra languages if empty or just to enrich
      while (selectedLanguages.length < 1 || (selectedLanguages.length < 4 && Math.random() < 0.4)) {
        const randomLang = LANGUAGES[Math.floor(Math.random() * LANGUAGES.length)];
        if (!selectedLanguages.includes(randomLang)) {
          selectedLanguages.push(randomLang);
        }
      }

      selectedLanguages.forEach(l => stats.languages.add(l));

      // Supported Rituals: 3 to 10 rituals
      const selectedRituals = [];
      const numRituals = 3 + Math.floor(Math.random() * 8); // 3 to 10

      if (status === 'verified') {
        // Guarantee at least 10 verified Pandits per ritual:
        // Use i % rituals.length to ensure every ritual is assigned as the primary ritual of approximately 450/N pandits.
        const primaryRitualIndex = (i - 1) % rituals.length;
        const primaryRitual = rituals[primaryRitualIndex];
        selectedRituals.push(primaryRitual);
        stats.ritualCoverage[primaryRitual._id.toString()].verifiedCount += 1;

        // Fill the remaining (numRituals - 1) rituals
        const tempRituals = rituals.filter(r => r._id.toString() !== primaryRitual._id.toString());
        // Prioritize rituals with less coverage first to maintain perfect distribution
        tempRituals.sort((a, b) => {
          const countA = stats.ritualCoverage[a._id.toString()].verifiedCount;
          const countB = stats.ritualCoverage[b._id.toString()].verifiedCount;
          return countA - countB;
        });

        // Add additional rituals
        for (let j = 0; j < numRituals - 1; j++) {
          if (tempRituals[j]) {
            selectedRituals.push(tempRituals[j]);
            stats.ritualCoverage[tempRituals[j]._id.toString()].verifiedCount += 1;
          }
        }
      } else {
        // For pending and rejected pandits, randomize 3 to 10 rituals
        const tempRituals = [...rituals];
        for (let j = 0; j < numRituals; j++) {
          const idx = Math.floor(Math.random() * tempRituals.length);
          selectedRituals.push(tempRituals[idx]);
          tempRituals.splice(idx, 1);
        }
      }

      stats.ritualsAssigned += selectedRituals.length;

      // Build pricing map based on ritual priceRange
      const pricingMap = new Map();
      selectedRituals.forEach(r => {
        const min = r.priceRange.min || 1000;
        const max = r.priceRange.max || 8000;
        // Generate realistic price between min and max, rounded to nearest 100
        const price = Math.round((min + Math.random() * (max - min)) / 100) * 100;
        pricingMap.set(r._id.toString(), price);
      });

      // Specialization name for Bio
      const specialties = [
        'Vedic Pujas & Havan',
        'Marriage & Family Ceremonies',
        'Shiva & Protection Homa',
        'Griha Pravesh & Property Pujas',
        'Child & Sanskar Ceremonies'
      ];
      const specialty = specialties[(i - 1) % specialties.length];

      // Create Pandit Profile (photo strictly empty/null as required)
      await Pandit.create({
        userId: user._id,
        photo: '',
        bio: generateBio(displayName, experience, cityInfo.city, specialty),
        location: {
          city: cityInfo.city,
          region: cityInfo.state,
          state: cityInfo.state
        },
        yearsOfExperience: experience,
        supportedRituals: selectedRituals.map(r => r._id),
        languagesSpoken: selectedLanguages,
        pricing: pricingMap,
        verificationStatus: status,
        verificationNote: status === 'rejected' ? 'Document verification failed.' : '',
        isActive: true
      });

      if (i % 50 === 0) {
        console.log(`👉 Created ${i}/515 Pandits...`);
      }
    }

    // ── Seeding Report Printout ──
    console.log('\n🎉 Pandit Dataset Seeded Successfully!');
    console.log('─────────────────────────────────');
    console.log(`Total Pandits: ${stats.total}`);
    console.log(`Verified: ${stats.verified}`);
    console.log(`Pending: ${stats.pending}`);
    console.log(`Rejected: ${stats.rejected}`);
    console.log('─────────────────────────────────');
    console.log(`Cities Covered: ${stats.cities.size} (${Array.from(stats.cities).join(', ')})`);
    console.log(`Languages Covered: ${stats.languages.size} (${Array.from(stats.languages).join(', ')})`);
    console.log('─────────────────────────────────');
    console.log('Ritual Coverage (Verified Pandits count per Ritual):');
    
    let minVerifiedCount = Infinity;
    Object.values(stats.ritualCoverage).forEach(item => {
      console.log(`- ${item.name}: ${item.verifiedCount}`);
      if (item.verifiedCount < minVerifiedCount) {
        minVerifiedCount = item.verifiedCount;
      }
    });

    console.log('─────────────────────────────────');
    console.log(`Minimum Pandits Per Ritual: ${minVerifiedCount}`);
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedPandits();
