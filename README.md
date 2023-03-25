# Youtube to Spotify Playlist Copier

A web app that will copy your youtube songs playlist into your spotify account.

- Ask user to provide youtube playlist url.
- Fetch all songs from playlist using youtube's official api.
- Use some sort of AI's API to get official name of the each song.
- Ask AI to separate them with commas & type insert "null" for songs it could not find the name.
- Implement client side authentication of spotify. (use spotify's documentation).
- Ask user to name the playlist & hit enter to create it.
- Start the process of copying, somehow indicate the successes & failures in the UI.

## Resources

**Spotify Authentication:** https://developer.spotify.com/documentation/general/guides/authorization/code-flow/

**Youtube API:** https://developers.google.com/youtube/v3/getting-started
