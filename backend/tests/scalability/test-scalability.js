
// Configuration
process.env.HTTP_PROXY = '';
process.env.HTTPS_PROXY = '';
process.env.http_proxy = '';
process.env.https_proxy = '';

const BASE_URL = 'http://localhost:5000/api';
const USERS_COUNT = 100;
const CONCURRENCY_LIMIT = 10;

// Stats
const stats = {
    registrations: { success: 0, failed: 0 },
    bookings: { success: 0, failed: 0 },
    latencies: []
};

// Helper: Sleep
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper: Random Number
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// 1. Fetch a Chef
async function getChef() {
    try {
        const res = await fetch(`${BASE_URL}/chefs`);
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();

        if (data.chefs && data.chefs.length > 0) {
            console.log(`Found ${data.chefs.length} chefs.`);
            return data.chefs.map(c => c._id);
        }

        throw new Error('No chefs found in response');
    } catch (error) {
        console.error('Failed to fetch chefs:', error.message);
        process.exit(1);
    }
}

// 2. Simulate User Journey
async function simulateUser(i, chefId) {
    const timestamp = Date.now();
    const userData = {
        name: `Test User ${timestamp} ${i}`,
        email: `loadtest_${timestamp}_${i}@example.com`,
        password: 'Password123!',
        phone: `9${random(100000000, 999999999)}` // Random 10-digit phone
    };

    const start = Date.now();
    let token = null;

    // Register (Now returns token for loadtest users)
    try {
        const res = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        token = data.token;
        stats.registrations.success++;
    } catch (error) {
        // console.error(error.message);
        stats.registrations.failed++;
        return; // Stop if registration fails
    }

    // Create Booking
    try {
        // Randomize time (08:00 to 20:00)
        const hour = random(8, 20);
        const minute = random(0, 59);
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

        const bookingData = {
            chefId: chefId,
            date: new Date(Date.now() + 86400000 * random(1, 60)).toISOString(), // 1-60 days in future to spread out
            time: timeString,
            duration: 2,
            serviceType: 'daily',
            guestCount: random(2, 6),
            totalPrice: 1500,
            location: '123 Test St, Test City',
            address: '123 Test St, Test City'
        };

        const res = await fetch(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(bookingData)
        });

        if (!res.ok) {
            const errData = await res.json();
            console.error(`Booking Failed:`, errData.message);
            throw new Error(errData.message || 'Booking failed');
        }

        stats.bookings.success++;
    } catch (error) {
        stats.bookings.failed++;
    }

    const duration = Date.now() - start;
    stats.latencies.push(duration);
}

// Main Execution
async function runLoadTest() {
    console.log(`Starting load test with ${USERS_COUNT} users...`);

    const chefIds = await getChef();
    console.log(`Targeting ${chefIds.length} chefs randomly.`);

    const promises = [];
    const startTotal = Date.now();

    for (let i = 0; i < USERS_COUNT; i++) {
        const randomChefId = chefIds[random(0, chefIds.length - 1)];
        promises.push(simulateUser(i, randomChefId));
        if (i % CONCURRENCY_LIMIT === 0) await sleep(100);
    }

    await Promise.all(promises);
    const totalTime = (Date.now() - startTotal) / 1000;

    // Report
    const avgLatency = stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length;
    const minLatency = Math.min(...stats.latencies);
    const maxLatency = Math.max(...stats.latencies);

    // Sort for percentiles
    stats.latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(stats.latencies.length * 0.95);
    const p95Latency = stats.latencies[p95Index];
    const p99Index = Math.floor(stats.latencies.length * 0.99);
    const p99Latency = stats.latencies[p99Index];

    const totalRequests = stats.registrations.success + stats.registrations.failed + stats.bookings.success + stats.bookings.failed; // Approx 2 reqs per user success
    // Actually total API calls is roughly 2 * users (register + booking) + initial chef fetch (1). 
    // Let's count "Transactions per second" (Users per second)
    const tps = USERS_COUNT / totalTime;

    console.log('\n=== Final Scalability Test Results ===');
    console.log(`Total Configuration: ${USERS_COUNT} Users, ${CONCURRENCY_LIMIT} Concurrent`);
    console.log(`Total Time:        ${totalTime.toFixed(2)}s`);
    console.log(`Throughput:        ${tps.toFixed(2)} Simulated Users/sec`);
    console.log('-------------------------------------------');
    console.log(`Latency (ms):`);
    console.log(`  Average: ${avgLatency.toFixed(2)}ms`);
    console.log(`  Min:     ${minLatency}ms`);
    console.log(`  Max:     ${maxLatency}ms`);
    console.log(`  p95:     ${p95Latency}ms`);
    console.log(`  p99:     ${p99Latency}ms`);
    console.log('-------------------------------------------');
    console.log(`Success Rates:`);
    console.log(`  Registrations: ${stats.registrations.success} Success, ${stats.registrations.failed} Failed`);
    console.log(`  Bookings:      ${stats.bookings.success} Success, ${stats.bookings.failed} Failed`);
    console.log('===========================================');
}

runLoadTest();
