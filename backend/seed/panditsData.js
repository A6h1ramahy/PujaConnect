const FIRST_NAMES = [
  'Ramesh', 'Suresh', 'Anil', 'Mahesh', 'Venkatesh', 'Raghavendra', 'Subramanya', 'Harish',
  'Rajesh', 'Dinesh', 'Arvind', 'Vinay', 'Krishna', 'Madhav', 'Gopal', 'Keshav', 'Vishnu',
  'Shiva', 'Ram', 'Laxman', 'Bharat', 'Sandeep', 'Pradeep', 'Alok', 'Manoj', 'Sanjay',
  'Vijay', 'Ajay', 'Sunil', 'Pawan', 'Tarun', 'Varun', 'Arun', 'Devendra', 'Bhaskar',
  'Aditya', 'Satish', 'Umesh', 'Girish', 'Nitin', 'Prashant', 'Deepak', 'Sanjeev', 'Ravi',
  'Kamal', 'Brijesh', 'Yogesh', 'Ashok', 'Kiran', 'Shashank', 'Anand'
];

const LAST_NAMES = [
  'Sharma', 'Joshi', 'Mishra', 'Dixit', 'Bhat', 'Acharya', 'Shastri', 'Kulkarni',
  'Dwivedi', 'Trivedi', 'Chaturvedi', 'Pandey', 'Vyas', 'Upadhyay', 'Tiwari',
  'Shukla', 'Dubey', 'Iyer', 'Iyengar', 'Rao', 'Nayak', 'Shenoy', 'Prabhu',
  'Hegde', 'Deshpande', 'Bhatt', 'Pande', 'Choudhury', 'Mukherjee', 'Banerjee',
  'Patel', 'Pandya', 'Pathak', 'Trivedi', 'Dave', 'Mehta', 'Kulkarni', 'Joshi'
];

const CITIES = [
  { city: 'Bengaluru', region: 'Jayanagar', state: 'Karnataka' },
  { city: 'Bengaluru', region: 'Indiranagar', state: 'Karnataka' },
  { city: 'Mysuru', region: 'Gokulam', state: 'Karnataka' },
  { city: 'Hubballi', region: 'Vidyanagar', state: 'Karnataka' },
  { city: 'Mangaluru', region: 'Kodialbail', state: 'Karnataka' },
  { city: 'Mumbai', region: 'Andheri West', state: 'Maharashtra' },
  { city: 'Mumbai', region: 'Dadar', state: 'Maharashtra' },
  { city: 'Pune', region: 'Kothrud', state: 'Maharashtra' },
  { city: 'Nagpur', region: 'Dharampeth', state: 'Maharashtra' },
  { city: 'Nashik', region: 'Panchavati', state: 'Maharashtra' },
  { city: 'Delhi', region: 'Dwarka', state: 'Delhi' },
  { city: 'Delhi', region: 'Connaught Place', state: 'Delhi' },
  { city: 'Noida', region: 'Sector 62', state: 'Uttar Pradesh' },
  { city: 'Gurugram', region: 'DLF Phase 3', state: 'Haryana' },
  { city: 'Chennai', region: 'Mylapore', state: 'Tamil Nadu' },
  { city: 'Coimbatore', region: 'R.S. Puram', state: 'Tamil Nadu' },
  { city: 'Madurai', region: 'Anna Nagar', state: 'Tamil Nadu' },
  { city: 'Hyderabad', region: 'Gachibowli', state: 'Telangana' },
  { city: 'Hyderabad', region: 'Secunderabad', state: 'Telangana' },
  { city: 'Warangal', region: 'Hanamkonda', state: 'Telangana' },
  { city: 'Kochi', region: 'Ernakulam', state: 'Kerala' },
  { city: 'Thiruvananthapuram', region: 'Kowdiar', state: 'Kerala' },
  { city: 'Kolkata', region: 'Salt Lake', state: 'West Bengal' },
  { city: 'Ahmedabad', region: 'Satellite', state: 'Gujarat' },
  { city: 'Surat', region: 'Adajan', state: 'Gujarat' },
  { city: 'Jaipur', region: 'Malviya Nagar', state: 'Rajasthan' },
  { city: 'Lucknow', region: 'Hazratganj', state: 'Uttar Pradesh' },
  { city: 'Varanasi', region: 'Assi Ghat', state: 'Uttar Pradesh' }
];

const LANGUAGES = [
  'Sanskrit', 'Hindi', 'Kannada', 'Tamil', 'Telugu', 'Malayalam', 'Marathi', 'Bengali', 'Gujarati'
];

const EXPERIENCE_LEVELS = [2, 5, 10, 15, 20, 30];

function generateBio(name, experience, city, specialty) {
  const bios = [
    `${name} is a highly respected priest in ${city} with over ${experience} years of experience in conducting traditional ${specialty} services. Trained in traditional Gurukul systems, offering authentic ceremonies.`,
    `A Vedic scholar specialized in ${specialty} rituals. Dedicated to maintaining the highest purity and devotion in every ceremony. Located in ${city} with ${experience} years of priestly service.`,
    `With ${experience} years of experience, ${name} offers comprehensive ${specialty} rituals for families and businesses in ${city}. Well-versed in Sanskrit mantras and classical Vedic traditions.`,
    `Performing sacred ceremonies for the last ${experience} years. Specializes in custom ${specialty} Pujas, ensuring a serene, spiritual atmosphere and adherence to scriptural guidelines.`
  ];
  return bios[Math.floor(Math.random() * bios.length)];
}

module.exports = {
  FIRST_NAMES,
  LAST_NAMES,
  CITIES,
  LANGUAGES,
  EXPERIENCE_LEVELS,
  generateBio
};
