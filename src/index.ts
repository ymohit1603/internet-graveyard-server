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


// Twitter API helper
const twitterApi = axios.create({
  baseURL: 'https://api.twitter.com/2',
  headers: {
    'Authorization': `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
  }
});

// Twitter Routes
const getTwitterProfile: RequestHandler = async (req, res, next) => {
  try {
    const { username } = req.params;

    // Get user data from Twitter API
    const userResponse = await twitterApi.get(`/users/by/username/${username}`, {
      params: {
        'user.fields': 'profile_image_url,description'
      }
    });

    if (!userResponse.data.data) {
      res.status(404).json({ error: 'Twitter profile not found' });
      return;
    }

    const userData = userResponse.data.data;

    const profile: TwitterProfile = {
      username: userData.username,
      name: userData.name,
      avatar_url: userData.profile_image_url.replace('_normal', ''),
      description: userData.description
    };

    res.json(profile);
  } catch (error) {
    console.error('Error fetching Twitter profile:', error);
    res.status(500).json({ error: 'Failed to fetch Twitter profile' });
  }
};



// Health check endpoint
router.get('/health', (_, res) => {
  res.json({ status: 'ok' });
});

// Apply routes
app.use('/api', router);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 