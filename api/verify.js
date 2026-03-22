const Stripe = require('stripe');

const APP_URL = 'https://app.otmgpt.com';

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', 'https://otmgpt.com');
  res.setHeader('Access-Control-Allow-Methods', 'GET');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  try {
    const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.status === 'complete') {
      return res.status(200).json({ url: APP_URL });
    }

    return res.status(403).json({ error: 'Payment not completed' });
  } catch (err) {
    return res.status(500).json({ error: 'Verification failed' });
  }
};
