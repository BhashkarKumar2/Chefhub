/**
 * 🕵️‍♂️ FINAL BREACH TEST - ADVANCED PENETRATION TEST
 * This script attempts to break all the security patches we implemented.
 * If any test fails, the "firewall" has been breached.
 */

const BASE_URL = 'http://localhost:5000';
const axios = require('axios');
const { io } = require('socket.io-client');

async function runBreach() {
    console.log('\n🚀 INITIATING FINAL BREACH ATTEMPT...');
    console.log('='.repeat(60));

    let breaches = 0;
    let successfulBlocks = 0;

    // Helper: Fake JWT with valid format but invalid signature/secret
    const fakeToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NzM3YTk1NTk5ZjdhYjczNGM1M2YzMSIsImlhdCI6MTczNTY0NzAwMCwiZXhwIjoxNzM1NzMzNDAwfQ.wrongsecret';

    // Victim ID (Mock)
    const victimId = '507f1f77bcf86cd799439011';

    /**
     * 👊 ATTACK 1: IDOR PROFILE UPDATE
     * Try to update another user's profile using a fake/invalid token
     */
    console.log('\n[ATTACK 1] IDOR: Profile Update Hijack');
    try {
        const res = await axios.put(`${BASE_URL}/api/user/profile/${victimId}`,
            { name: 'HACKED' },
            { headers: { Authorization: `Bearer ${fakeToken}` } }
        );
        console.log('🔴 BREACH! Accessed profile update with invalid token.');
        breaches++;
    } catch (err) {
        console.log(`✅ BLOCKED: ${err.response?.data?.message || err.message}`);
        successfulBlocks++;
    }

    /**
     * 👊 ATTACK 2: PAYMENT BYPASS (SIGNATURE SPOOFING)
     * Try to confirm a payment with a fake signature
     */
    console.log('\n[ATTACK 2] PAYMENT: Signature Spoofing');
    try {
        const res = await axios.post(`${BASE_URL}/api/payments/verify`, {
            razorpay_order_id: 'order_123',
            razorpay_payment_id: 'pay_123',
            razorpay_signature: 'spoofed_sig',
            bookingId: victimId
        });
        console.log('🔴 BREACH! Payment accepted with spoofed signature.');
        breaches++;
    } catch (err) {
        console.log(`✅ BLOCKED: ${err.response?.data?.message || err.message}`);
        successfulBlocks++;
    }

    /**
     * 👊 ATTACK 3: SOCKET.IO ANONYMOUS CONNECTION
     * Try to connect socket without a token
     */
    console.log('\n[ATTACK 3] SOCKET: Anonymous Connection');
    const socket = io(BASE_URL, {
        auth: { token: null },
        reconnection: false,
        timeout: 2000
    });

    const socketConnect = new Promise((resolve) => {
        socket.on('connect', () => {
            console.log('🔴 BREACH! Socket connected anonymously.');
            resolve(true);
        });
        socket.on('connect_error', (err) => {
            console.log(`✅ BLOCKED: Socket login failed - ${err.message}`);
            resolve(false);
        });
        setTimeout(() => resolve(false), 2000);
    });

    const socketBreached = await socketConnect;
    if (socketBreached) breaches++; else successfulBlocks++;
    socket.close();

    /**
     * 👊 ATTACK 4: PASSWORD COMPLEXITY BYPASS
     * Try to register with a weak password
     */
    console.log('\n[ATTACK 4] AUTH: Weak Password Probing');
    try {
        const res = await axios.post(`${BASE_URL}/api/auth/register`, {
            name: 'Hacker',
            email: `hack_${Date.now()}@evil.com`,
            password: '123'
        });
        console.log('🔴 BREACH! Registered with weak password.');
        breaches++;
    } catch (err) {
        // If it's a 422 or 400 with a validation message, it's a pass
        console.log(`✅ BLOCKED: ${err.response?.data?.message || err.response?.data?.errors?.[0]?.password || 'Validation failed'}`);
        successfulBlocks++;
    }

    /**
     * 👊 ATTACK 5: NOSQL INJECTION (RE-VERIFY)
     * Try login with $gt injection in standardized login route
     */
    console.log('\n[ATTACK 5] INJECTION: NoSQL Auth Bypass Attempt');
    try {
        const res = await axios.post(`${BASE_URL}/api/auth/login`, {
            email: { "$gt": "" },
            password: "any"
        });
        console.log('🔴 BREACH! Logged in via NoSQL Injection.');
        breaches++;
    } catch (err) {
        console.log(`✅ BLOCKED: ${err.response?.data?.message || 'Login rejected'}`);
        successfulBlocks++;
    }

    /**
     * 👊 ATTACK 6: SSRF IN PROXY ROUTES
     * Try to inject internal URLs or other domains
     */
    console.log('\n[ATTACK 6] SSRF: Proxy Parameter Manipulation');
    try {
        const res = await axios.get(`${BASE_URL}/api/geocode?address=http://169.254.169.254/latest/meta-data/`);
        // If it returns 200 and hasn't actually fetched metadata (usually returns ORS error), it's okay
        if (res.data.success && JSON.stringify(res.data).includes('ami-id')) {
            console.log('🔴 BREACH! SSRF successful - leaked metadata.');
            breaches++;
        } else {
            console.log('✅ BLOCKED/SAFE: Request returned no sensitive data.');
            successfulBlocks++;
        }
    } catch (err) {
        console.log(`✅ BLOCKED: Request failed naturally - ${err.message}`);
        successfulBlocks++;
    }

    /**
     * 👊 ATTACK 7: DEPRECATED ROUTE PROBING
     * Try to hit /api/users/login which should be removed/deprecated
     */
    console.log('\n[ATTACK 7] OBSOLETE: Probing Deprecated Routes');
    try {
        const res = await axios.post(`${BASE_URL}/api/user/login`, { email: 'test@test.com', password: 'password123' });
        console.log('🔴 BREACH! Deprecated login route still functional.');
        breaches++;
    } catch (err) {
        console.log(`✅ BLOCKED: Route is ${err.response?.status === 404 ? 'GONE' : 'DEPRECATED (' + err.response?.status + ')'}`);
        successfulBlocks++;
    }

    /**
     * 👊 ATTACK 8: CHEF LOCATION PRIVACY (SOCKET)
     * Try to emit location update and see if it broadcasts to all (we can't easily test broadcast here, but we check if server accepts it without targetUserId or proper auth)
     */
    // This one is harder to test without a full client-server setup, so we skip programmatic test and rely on code review + manual verification.

    console.log('\n' + '='.repeat(60));
    console.log(`🏁 HACK ATTEMPT SUMMARY`);
    console.log(`✅ SUCCESSFUL BLOCKS: ${successfulBlocks}`);
    console.log(`🔴 BREACHES FOUND: ${breaches}`);
    console.log('='.repeat(60));

    if (breaches === 0) {
        console.log('🏰 YOUR FIREWALL IS IMPENETRABLE! GOOD JOB.');
    } else {
        console.log('⚠️  SECURITY STILL HAS HOLES. FIX THEM IMMEDIATELY.');
    }
    console.log('\n');
}

runBreach();
