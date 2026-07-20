require('dotenv').config();
const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

let twitchAccessToken = '';



async function getTwitchAccessToken(){
  const response = await fetch('https://id.twitch.tv/oauth2/token', {
    method: 'POST',
    headers: {'Content-Type': 'application/x-www-form-urlencoded' },
    body : new URLSearchParams({
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      grant_type: 'client_credentials'
    })
  });
  const data = await response.json();
  console.log(data)
  twitchAccessToken = data.access_token;
  return twitchAccessToken
}

app.get('/api/status', async (req, res) => {
  const username = process.env.STREAMER_NAME;

  try {
    if (!twitchAccessToken){
      await getTwitchAccessToken();
    }
    let response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`,{
      headers: {
        'Client-ID' : process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchAccessToken}`
      }
    });
    if (response.status === 401){
      await getTwitchAccessToken();
      response = await fetch(`https://api.twitch.tv/helix/streams?user_login=${username}`,{
        headers: {
          'client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization' : `Bearer ${twitchAccessToken}`
        }
      });
    }


    const result = await response.json();

    if (result.data && result.data.length > 0){
      const streamInfo = result.data[0];
      res.json({
        isLive: true,
        title: streamInfo.title,
        viewerCount: streamInfo.viewer_count,
        game: streamInfo.game_name
      });
    } else {
      res.json({isLive: false});
    }
  }
  catch (error){
    console.error("Error fetching from TWITCH API:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
  
});

app.get('/api/schedule', async (req, res) => {
  const username = process.env.STREAMER_NAME;

  try {
    if (!twitchAccessToken){
      await getTwitchAccessToken();
    }
    let response = await fetch(`https://api.twitch.tv/helix/schedule?broadcaster_id=28219022`,{
      headers: {
        'Client-ID' : process.env.TWITCH_CLIENT_ID,
        'Authorization': `Bearer ${twitchAccessToken}`
      }
    });
    if (response.status === 401){
      await getTwitchAccessToken();
      response = await fetch(`https://api.twitch.tv/helix/schedule?broadcaster_id=28219022`,{
        headers: {
          'client-ID': process.env.TWITCH_CLIENT_ID,
          'Authorization' : `Bearer ${twitchAccessToken}`
        }
      });
    }


    const result = await response.json();
    if (result.data.segments){
      const nextStream = result.data.segments[0]
      res.json({
        startTime: nextStream.start_time,
        title : nextStream.title
      })
    }


  }
  catch (error){
    console.error("Error fetching from TWITCH API:", error);
    res.status(500).json({error: "Internal Server Error"});
  }
  
});


app.get(['/', '/index'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  console.log("Working")
});

app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`);
});