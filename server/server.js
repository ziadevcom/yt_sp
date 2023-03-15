const cors = require("cors");
const express = require("express");
const app = express();
const port = 3000;
const router = express.Router();
app.use(cors());

// Load Youtube API key
require("dotenv").config();

// Get playlist endpoint
router.get("/:id", async (req, res) => {
  try {
    const json = await fetch(
      `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=999&playlistId=${req.params.id}&key=${process.env.API_KEY}`
    );
    let response = await json.json();

    // Error handling, in case api error, throw an error
    if (response.error) {
      console.log(response.error);
      throw new Error("API Failure.");
    }

    // Format the response before returning
    const items = response.items
      .map((obj) => {
        // Checking if video is private then return null so we can filter and remove these later.
        if (
          obj.snippet.title === "Private video" ||
          obj.snippet.title === "Deleted video"
        ) {
          return null;
        }
        let thumbnail = obj.snippet.thumbnails.maxres;
        console.log(thumbnail);
        if (!thumbnail) {
          thumbnail = obj.snippet.thumbnails.high;
        }
        return {
          id: obj.snippet.resourceId.videoId,
          title: obj.snippet.title,
          thumbnail,
        };
      })
      .filter((item) => {
        if (!item) {
          return false;
        }
        return true;
      });

    // Send json response of all videos
    res.json(items);
  } catch (error) {
    res.json({ error: true, message: error.message });
  }
});

// Get user acess token spoitfy

router.get("/spotify/:authorizationCode", async (req, res) => {
  // authorization code from client
  let clientId = process.env.CLIENT_ID;
  let clientSecret = process.env.CLIENT_SECRET;
  const authrorizationCode = req.params.authorizationCode;

  // Call spotify api to get access token
  // access token is used when calling spotify api on behalf of a user
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST", // *GET, POST, PUT, DELETE, etc.
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic " +
          Buffer.from(clientId + ":" + clientSecret).toString("base64"),
      },

      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: authrorizationCode,
        redirect_uri: "http://127.0.0.1:5500/frontend/",
      }), // body data type must match "Content-Type" header
    });
    const json = await response.json(); // parses JSON response into native JavaScript objects
    res.json(json);
  } catch (e) {
    res.json({ error: e.message });
  }
});
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(router);
