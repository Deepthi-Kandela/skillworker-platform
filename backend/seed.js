const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Worker = require('./models/Worker');
const Category = require('./models/Category');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Worker.deleteMany({});
  await Category.deleteMany({});
  console.log('Cleared existing data');

  // NOTE: Do NOT pre-hash passwords — User model pre-save hook handles hashing
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@skillworker.com',
    password: 'admin123',
    phone: '9000000001',
    role: 'admin',
    isVerified: true,
    isActive: true,
    address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
  });

  const customer = await User.create({
    name: 'Rahul Sharma',
    email: 'customer@test.com',
    password: 'test123',
    phone: '9000000002',
    role: 'customer',
    isVerified: true,
    isActive: true,
    address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400002' },
  });

  const workerUser = await User.create({
    name: 'Suresh Kumar',
    email: 'worker@test.com',
    password: 'test123',
    phone: '9000000003',
    role: 'worker',
    isVerified: true,
    isActive: true,
    address: { city: 'Mumbai', state: 'Maharashtra', pincode: '400003' },
  });

  const workerUser2 = await User.create({
    name: 'Ramesh Patel',
    email: 'worker2@test.com',
    password: 'test123',
    phone: '9000000004',
    role: 'worker',
    isVerified: true,
    isActive: true,
    address: { city: 'Delhi', state: 'Delhi', pincode: '110001' },
  });

  const workerUser3 = await User.create({
    name: 'Priya Nair',
    email: 'worker3@test.com',
    password: 'test123',
    phone: '9000000005',
    role: 'worker',
    isVerified: true,
    isActive: true,
    address: { city: 'Bangalore', state: 'Karnataka', pincode: '560001' },
  });

  // Create worker profiles
  await Worker.create({
    user: workerUser._id,
    category: 'Plumber',
    skills: ['Pipe fitting', 'Leak repair', 'Bathroom installation', 'Water heater'],
    bio: 'Experienced plumber with 8 years of expertise in residential and commercial plumbing. Available 24/7 for emergencies.',
    experience: 8,
    hourlyRate: 400,
    isVerified: true,
    isAvailable: true,
    rating: 4.7,
    totalReviews: 34,
    totalBookings: 120,
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], startTime: '08:00', endTime: '20:00' },
  });

  await Worker.create({
    user: workerUser2._id,
    category: 'Electrician',
    skills: ['Wiring', 'Panel upgrades', 'Lighting installation', 'Fan fitting', 'AC installation'],
    bio: 'Certified electrician with 5 years of experience. Specializing in home wiring, panel upgrades, and smart home installations.',
    experience: 5,
    hourlyRate: 500,
    isVerified: true,
    isAvailable: true,
    rating: 4.5,
    totalReviews: 22,
    totalBookings: 85,
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], startTime: '09:00', endTime: '18:00' },
  });

  await Worker.create({
    user: workerUser3._id,
    category: 'Tutor',
    skills: ['Mathematics', 'Physics', 'Chemistry', 'English', 'Competitive Exams'],
    bio: 'M.Sc. graduate with 4 years of tutoring experience. Helped 100+ students crack competitive exams like JEE and NEET.',
    experience: 4,
    hourlyRate: 600,
    isVerified: true,
    isAvailable: true,
    rating: 4.9,
    totalReviews: 58,
    totalBookings: 200,
    availability: { days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], startTime: '07:00', endTime: '21:00' },
  });

  // Create categories
  const categories = [
    { name: 'Plumber', icon: '🔧', description: 'Pipe fitting, leak repair, bathroom installation' },
    { name: 'Electrician', icon: '⚡', description: 'Wiring, panel upgrades, lighting installation' },
    { name: 'Mechanic', icon: '🔩', description: 'Car repair, bike service, engine diagnostics' },
    { name: 'Tutor', icon: '📚', description: 'Math, science, language, competitive exams' },
    { name: 'Carpenter', icon: '🪚', description: 'Furniture making, wood repair, custom cabinets' },
    { name: 'Painter', icon: '🎨', description: 'Interior, exterior, waterproofing, texture' },
    { name: 'Cleaner', icon: '🧹', description: 'Home cleaning, deep cleaning, office cleaning' },
    { name: 'Tailor', icon: '🧵', description: 'Stitching, alterations, custom clothing' },
  ];
  await Category.insertMany(categories);

  console.log('\n✅ Seed completed successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Demo Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin   → admin@skillworker.com  / admin123');
  console.log('Worker  → worker@test.com        / test123');
  console.log('Customer→ customer@test.com      / test123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
