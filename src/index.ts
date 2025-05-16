import express, { RequestHandler } from 'express';
import { Router } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

const app = express();
const router = Router();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Types
interface TwitterProfile {
  username: string;
  name: string;
  avatar_url: string;
  description: string;
}

// Twitter API instance
const twitterApi = axios.create({
  baseURL: 'https://api.twitter.com/2',
  headers: {
    'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
  },
});

// Route handler
const getTwitterProfile: RequestHandler = async (req, res) => {
  try {
    const { username } = req.params;
    console.log(`[server] Fetching Twitter profile for: ${username}`);

    // 1. Get user data from Twitter
    const twitterRes = await twitterApi.get(`/users/by/username/${username}`, {
      params: {
        'user.fields': 'name,profile_image_url,description',
      },
    });

    console.log('[server] Raw Twitter response:', twitterRes.data);

    const user = twitterRes.data?.data;

    if (!user) {
      console.warn('[server] User not found on Twitter:', username);
      return res.status(404).json({ error: 'User not found' });
    }

    // 2. Return clean data
    const profile: TwitterProfile = {
      username: user.username,
      name: user.name,
      avatar_url: user.profile_image_url,
      description: user.description,
    };

    console.log('[server] Sending profile:', profile);
    res.json(profile);
  } catch (error: any) {
    console.error('[server] Error fetching profile:', error?.response?.data || error.message);
    res.status(500).json({ error: 'Failed to fetch Twitter profile' });
  }
};

router.get('/social/profile/:username', getTwitterProfile);

// Health check
router.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

app.use('/api', router);

// Default route
app.get('/', (_, res) => {
  console.log('[server] Hello World hit');
  res.json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
