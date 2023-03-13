const express = require("express");
const app = express();
const port = 3000;
const router = express.Router();

// Load Youtube API key
require("dotenv").config();

//
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

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

app.use(router);
