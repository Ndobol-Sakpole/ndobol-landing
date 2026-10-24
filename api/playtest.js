import { handleVercelPlaytest } from '../backend/vercel-playtest.js';
export default (req, res) => handleVercelPlaytest(req, res, '/api/playtest');
