import mongoose from 'mongoose';
import '../config/loadEnv.js';
import User from '../models/User.js';
import Chef from '../models/Chef.js';
import Booking from '../models/Booking.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Test User Model Validations
const testUserValidations = async () => {
  console.log('\n🧪 Testing User Model Validations...\n');

  // Test 1: Valid user
  try {
    const validUser = new User({
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'password123'
    });
    await validUser.validate();
    console.log('✅ Valid user passed validation');
  } catch (error) {
    console.log('❌ Valid user failed:', error.message);
  }

  // Test 2: Name too short
  try {
    const shortName = new User({
      name: 'A',
      email: 'test@example.com',
      password: 'password123'
    });
    await shortName.validate();
    console.log('❌ Short name should have failed');
  } catch (error) {
    console.log('✅ Short name validation failed (expected):', error.errors.name.message);
  }

  // Test 3: Invalid email format
  try {
    const invalidEmail = new User({
      name: 'John Doe',
      email: 'invalid-email',
      password: 'password123'
    });
    await invalidEmail.validate();
    console.log('❌ Invalid email should have failed');
  } catch (error) {
    console.log('✅ Invalid email validation failed (expected):', error.errors.email.message);
  }

  // Test 4: Password too short
  try {
    const shortPassword = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: '12345'
    });
    await shortPassword.validate();
    console.log('❌ Short password should have failed');
  } catch (error) {
    console.log('✅ Short password validation failed (expected):', error.errors.password.message);
  }

  // Test 5: Bio too long
  try {
    const longBio = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      bio: 'A'.repeat(501)
    });
    await longBio.validate();
    console.log('❌ Long bio should have failed');
  } catch (error) {
    console.log('✅ Long bio validation failed (expected):', error.errors.bio.message);
  }

  // Test 6: Invalid phone format
  try {
    const invalidPhone = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      phone: '123'
    });
    await invalidPhone.validate();
    console.log('❌ Invalid phone should have failed');
  } catch (error) {
    console.log('✅ Invalid phone validation failed (expected):', error.errors.phone.message);
  }

  // Test 7: Too many cuisine preferences
  try {
    const tooManyCuisines = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      cuisinePreferences: Array(21).fill('Italian')
    });
    await tooManyCuisines.validate();
    console.log('❌ Too many cuisine preferences should have failed');
  } catch (error) {
    console.log('✅ Too many cuisines validation failed (expected):', error.errors.cuisinePreferences.message);
  }
};

// Test Chef Model Validations
const testChefValidations = async () => {
  console.log('\n🧪 Testing Chef Model Validations...\n');

  // Test 1: Valid chef
  try {
    const validChef = new Chef({
      name: 'Chef Mario',
      email: 'mario@example.com',
      specialty: 'Italian Cuisine',
      bio: 'Experienced Italian chef with 15 years of expertise in authentic pasta and pizza.',
      pricePerHour: 1500,
      experienceYears: 15
    });
    await validChef.validate();
    console.log('✅ Valid chef passed validation');
  } catch (error) {
    console.log('❌ Valid chef failed:', error.message);
  }

  // Test 2: Bio too short
  try {
    const shortBio = new Chef({
      name: 'Chef Mario',
      email: 'mario@example.com',
      specialty: 'Italian',
      bio: 'Short bio',
      pricePerHour: 1500,
      experienceYears: 15
    });
    await shortBio.validate();
    console.log('❌ Short bio should have failed');
  } catch (error) {
    console.log('✅ Short bio validation failed (expected):', error.errors.bio.message);
  }

  // Test 3: Invalid email
  try {
    const invalidEmail = new Chef({
      name: 'Chef Mario',
      email: 'not-an-email',
      specialty: 'Italian',
      bio: 'Experienced Italian chef with 15 years of expertise.',
      pricePerHour: 1500,
      experienceYears: 15
    });
    await invalidEmail.validate();
    console.log('❌ Invalid email should have failed');
  } catch (error) {
    console.log('✅ Invalid email validation failed (expected):', error.errors.email.message);
  }

  // Test 4: Negative price
  try {
    const negativePrice = new Chef({
      name: 'Chef Mario',
      email: 'mario@example.com',
      specialty: 'Italian',
      bio: 'Experienced Italian chef with 15 years of expertise.',
      pricePerHour: -500,
      experienceYears: 15
    });
    await negativePrice.validate();
    console.log('❌ Negative price should have failed');
  } catch (error) {
    console.log('✅ Negative price validation failed (expected):', error.errors.pricePerHour.message);
  }

  // Test 5: Invalid availability
  try {
    const invalidAvailability = new Chef({
      name: 'Chef Mario',
      email: 'mario@example.com',
      specialty: 'Italian',
      bio: 'Experienced Italian chef with 15 years of expertise.',
      pricePerHour: 1500,
      experienceYears: 15,
      availability: 'sometimes'
    });
    await invalidAvailability.validate();
    console.log('❌ Invalid availability should have failed');
  } catch (error) {
    console.log('✅ Invalid availability validation failed (expected):', error.errors.availability.message);
  }

  // Test 6: Rating out of range
  try {
    const invalidRating = new Chef({
      name: 'Chef Mario',
      email: 'mario@example.com',
      specialty: 'Italian',
      bio: 'Experienced Italian chef with 15 years of expertise.',
      pricePerHour: 1500,
      experienceYears: 15,
      rating: 6
    });
    await invalidRating.validate();
    console.log('❌ Invalid rating should have failed');
  } catch (error) {
    console.log('✅ Invalid rating validation failed (expected):', error.errors.rating.message);
  }

  // Test 7: Invalid coordinates
  try {
    const invalidCoords = new Chef({
      name: 'Chef Mario',
      email: 'mario@example.com',
      specialty: 'Italian',
      bio: 'Experienced Italian chef with 15 years of expertise.',
      pricePerHour: 1500,
      experienceYears: 15,
      locationCoords: {
        lat: 100,
        lon: 200
      }
    });
    await invalidCoords.validate();
    console.log('❌ Invalid coordinates should have failed');
  } catch (error) {
    console.log('✅ Invalid coordinates validation failed (expected):', error.errors['locationCoords.lat'].message);
  }

  // Test 8: Too many serviceable locations
  try {
    const tooManyLocations = new Chef({
      name: 'Chef Mario',
      email: 'mario@example.com',
      specialty: 'Italian',
      bio: 'Experienced Italian chef with 15 years of expertise.',
      pricePerHour: 1500,
      experienceYears: 15,
      serviceableLocations: Array(51).fill('Delhi')
    });
    await tooManyLocations.validate();
    console.log('❌ Too many serviceable locations should have failed');
  } catch (error) {
    console.log('✅ Too many locations validation failed (expected):', error.errors.serviceableLocations.message);
  }
};

// Test Booking Model Validations
const testBookingValidations = async () => {
  console.log('\n🧪 Testing Booking Model Validations...\n');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Test 1: Valid booking
  try {
    const validBooking = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '10:30',
      duration: 3,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'birthday',
      totalPrice: 4500
    });
    await validBooking.validate();
    console.log('✅ Valid booking passed validation');
  } catch (error) {
    console.log('❌ Valid booking failed:', error.message);
  }

  // Test 2: Date in the past
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const pastDate = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: yesterday,
      time: '10:30',
      duration: 3,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'birthday',
      totalPrice: 4500
    });
    await pastDate.validate();
    console.log('❌ Past date should have failed');
  } catch (error) {
    console.log('✅ Past date validation failed (expected):', error.errors.date.message);
  }

  // Test 3: Invalid time format
  try {
    const invalidTime = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '25:99',
      duration: 3,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'birthday',
      totalPrice: 4500
    });
    await invalidTime.validate();
    console.log('❌ Invalid time should have failed');
  } catch (error) {
    console.log('✅ Invalid time validation failed (expected):', error.errors.time.message);
  }

  // Test 4: Duration exceeds limit
  try {
    const longDuration = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '10:30',
      duration: 25,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'birthday',
      totalPrice: 4500
    });
    await longDuration.validate();
    console.log('❌ Long duration should have failed');
  } catch (error) {
    console.log('✅ Long duration validation failed (expected):', error.errors.duration.message);
  }

  // Test 5: Invalid service type
  try {
    const invalidService = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '10:30',
      duration: 3,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'funeral',
      totalPrice: 4500
    });
    await invalidService.validate();
    console.log('❌ Invalid service type should have failed');
  } catch (error) {
    console.log('✅ Invalid service type validation failed (expected):', error.errors.serviceType.message);
  }

  // Test 6: Negative price
  try {
    const negativePrice = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '10:30',
      duration: 3,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'birthday',
      totalPrice: -500
    });
    await negativePrice.validate();
    console.log('❌ Negative price should have failed');
  } catch (error) {
    console.log('✅ Negative price validation failed (expected):', error.errors.totalPrice.message);
  }

  // Test 7: Guest count too high
  try {
    const tooManyGuests = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '10:30',
      duration: 3,
      guestCount: 1001,
      location: '123 Main Street, Delhi',
      serviceType: 'birthday',
      totalPrice: 4500
    });
    await tooManyGuests.validate();
    console.log('❌ Too many guests should have failed');
  } catch (error) {
    console.log('✅ Too many guests validation failed (expected):', error.errors.guestCount.message);
  }

  // Test 8: Invalid contact email
  try {
    const invalidEmail = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '10:30',
      duration: 3,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'birthday',
      totalPrice: 4500,
      contactInfo: {
        name: 'John Doe',
        email: 'not-valid-email',
        phone: '+919876543210'
      }
    });
    await invalidEmail.validate();
    console.log('❌ Invalid contact email should have failed');
  } catch (error) {
    console.log('✅ Invalid contact email validation failed (expected):', error.errors['contactInfo.email'].message);
  }

  // Test 9: Invalid meal types for daily service
  try {
    const invalidMealTypes = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '10:30',
      duration: 3,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'daily',
      totalPrice: 4500,
      serviceDetails: {
        daily: {
          mealTypes: ['breakfast', 'lunch', 'dinner', 'snacks', 'extra']
        }
      }
    });
    await invalidMealTypes.validate();
    console.log('❌ Invalid meal types should have failed');
  } catch (error) {
    console.log('✅ Invalid meal types validation failed (expected):', error.message);
  }

  // Test 10: Too many add-ons
  try {
    const tooManyAddOns = new Booking({
      chef: new mongoose.Types.ObjectId(),
      date: tomorrow,
      time: '10:30',
      duration: 3,
      guestCount: 10,
      location: '123 Main Street, Delhi',
      serviceType: 'birthday',
      totalPrice: 4500,
      addOns: Array(21).fill('Extra service')
    });
    await tooManyAddOns.validate();
    console.log('❌ Too many add-ons should have failed');
  } catch (error) {
    console.log('✅ Too many add-ons validation failed (expected):', error.errors.addOns.message);
  }
};

// Run all tests
const runTests = async () => {
  await connectDB();
  
  await testUserValidations();
  await testChefValidations();
  await testBookingValidations();
  
  console.log('\n✅ All validation tests completed!\n');
  process.exit(0);
};

runTests();
