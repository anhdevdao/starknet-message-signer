import express from 'express';
import { json } from 'body-parser';

const app = express();

app.use(json());

// Add your API routes here
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Export for serverless use
export default app;
