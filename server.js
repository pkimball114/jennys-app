const fs = require("fs");
const ytdl = require("ytdl-core");
const express = require("express");
var cors = require("cors");
var path = require("path");
const app = express();

var http = require("http").createServer(app);
// const io = require("socket.io")(http);

const port = process.env.PORT || 5000;

var clientGlob = null;
// TypeScript: import ytdl from 'ytdl-core'; with --esModuleInterop
// TypeScript: import * as ytdl from 'ytdl-core'; with --allowSyntheticDefaultImports
// TypeScript: import ytdl = require('ytdl-core'); with neither of the above

getAudio = (videoURL, res) => {
  console.log(videoURL);

  // ytdl('http://www.youtube.com/watch?v=aqz-KE-bpKQ',{
  //   filter: "audioonly",
  // })
  // .pipe(fs.createWriteStream('video.m4a'));

  // ytdl.getInfo(videoURL).then((info) => {
  //   // Select the video format and quality
  //   const format = ytdl.chooseFormat(info.formats, {
  //     quality: "highestaudio",
  //     filter: "audioonly"
  //   });

  //   // Create a write stream to save the video file
  //   const outputFilePath = `${info.videoDetails.title}.mp3`;
  //   const outputStream = fs.createWriteStream(outputFilePath);
  //   // Download the video file
  //   ytdl.downloadFromInfo(info, { format: format }).pipe(outputStream);
  //   // When the download is complete, show a message
  //   outputStream.on('finish', () => {
  //     console.log(`Finished downloading: ${outputFilePath}`);
  //   });
  // });

  var stream = ytdl(videoURL, {
    filter: "audioonly",
  })
    .on("end", () => {
      console.log("Audio Downloaded");
    })
    .pipe(res);

  ytdl.getInfo(videoURL).then((info) => {
    console.log("title:", info.videoDetails.title);
    console.log("rating:", info.player_response.videoDetails.averageRating);
    console.log("uploaded by:", info.videoDetails.author.name);
  });
};

app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded({ extended: true })); // to support URL-encoded bodies
app.use(cors());

//root handler that sends the parameters to getAudio function
app.post("/", (req, res) => {
  console.log('POST request received:', req.body);
  getAudio(req.body.url, res);
});

//socket.io connection
// io.on("connection", (client) => {
//   clientGlob = client;
//   console.log("User connected");
// });

http.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});