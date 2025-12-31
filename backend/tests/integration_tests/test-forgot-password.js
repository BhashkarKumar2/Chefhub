import axios from 'axios';

const BASE = process.env.BASE_URL || 'http://localhost:5000';

async function run() {
	try {
		console.log('POST /api/auth/forgot-password');
		const resp = await axios.post(`${BASE}/api/auth/forgot-password`, { email: 'test@example.com' }, {
			headers: { 'Content-Type': 'application/json' },
			timeout: 10000
		});

		console.log('Response status:', resp.status);
		console.log('Response data:', resp.data);

		// If development fallback returned resetUrl, follow through
		if (resp.data && resp.data.resetUrl) {
			const resetUrl = resp.data.resetUrl;
			console.log('\nFound resetUrl (development):', resetUrl);

			// extract token from URL
			const parts = resetUrl.split('/');
			const token = parts[parts.length - 1];
			console.log('Token:', token);

			// Verify token
			const verify = await axios.get(`${BASE}/api/auth/reset-password/${token}`);
			console.log('Verify token response:', verify.status, verify.data);

			// Attempt to reset password
			const newPassword = 'NewPass123!';
			const resetResp = await axios.post(`${BASE}/api/auth/reset-password/${token}`, { password: newPassword }, {
				headers: { 'Content-Type': 'application/json' }
			});
			console.log('Reset response:', resetResp.status, resetResp.data);
		} else {
			console.log('\nNo resetUrl in response; email likely sent. Manual verification required.');
		}
	} catch (err) {
			console.error('\n--- ERROR ---');
			console.error('Message:', err.message);
			if (err.code) console.error('Code:', err.code);
			if (err.response) {
				console.error('Response status:', err.response.status);
				console.error('Response data:', err.response.data);
			}
			if (err.stack) console.error('Stack:', err.stack.split('\n').slice(0,5).join('\n'));
		process.exitCode = 1;
	}
}

run();
