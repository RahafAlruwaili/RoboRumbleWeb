const main = async () => {
    const SUPABASE_URL = 'https://bmwasmjxptwkrpvqazbf.supabase.co';
    const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtd2FzbWp4cHR3a3JwdnFhemJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxODAzMDMsImV4cCI6MjA4Mzc1NjMwM30.JUiVIvKJmw3x9jCsI-w7RKQfYFLzQ1tTlBCgcDbrY6Q';

    const url = `${SUPABASE_URL}/functions/v1/send-welcome-email`;

    console.log('Testing send-welcome-email anonymously...');
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}` // Using ANON key, simulating user not logged in or anon
            },
            body: JSON.stringify({
                email: 'test_anon@example.com',
                fullName: 'Test Anon'
            })
        });

        console.log(`Status: ${response.status} ${response.statusText}`);
        const text = await response.text();
        console.log('Response:', text);
    } catch (e) {
        console.error('Error:', e);
    }
}
main();
