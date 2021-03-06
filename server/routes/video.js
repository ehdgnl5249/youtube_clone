const express = require('express');
const router = express.Router();
const { Video } = require("../models/Video");
const { Subscribe } = require("../models/Subscribe");

const { auth } = require("../middleware/auth");
const multer = require("multer");
const path = require('path');
const ffmpeg = require('fluent-ffmpeg');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    }
})


const fileFilter = (req, file, cb) => {
    var ext = path.extname(file.originalname);

    if (ext !== '.png' && ext !== '.jpg' && ext !== '.mp4') {
        return cb(new Error(true), false);
    }
    cb(null, true);
}


const upload = multer({ storage: storage, fileFilter:fileFilter }).single("file")


//=================================
//             Video
//=================================


router.post("/uploadVideo", (req, res) => {

    const video = new Video(req.body) // client에서 넘어온 variables(writer,title,description....)
                                      // 다 받아옴

    video.save((err, doc)=> {
        if(err)
            return res.json({ success: false, err })
        res.status(200).json({ success: true })
    })
    
});

router.get("/getVideos", (req, res) => {

    // 비디오를 DB에서 가져와서 클라이언트에 보냄
    
    Video.find() // 모든 비디오 가져옴
        .populate('writer') // populate를 해줘야 writer에 연결된 user 정보를 가져올 수 있음.
        .exec((err, videos)=> {
            if(err)
                return res.status(400).send(err);
            res.status(200).json({ success: true, videos })
        })
});



router.post("/getSubscriptionVideos", (req, res) => {

    // 자신의 Id를 가지고 구독하는 사람들 찾기
    Subscribe.find({ userFrom: req.body.userFrom })
        .exec(( err, subscriberInfo ) => {
            if(err) 
                return res.status(400).send(err);
            

            // userTo의 유저들이 자신이 구독하는 사람들
            let subscribedUser = [];

            subscriberInfo.map((subscriber, i) => {
                subscribedUser.push(subscriber.userTo);
            })

            // 찾은 사람들의 비디오를 가져옴
            Video.find({ writer: { $in: subscribedUser }}) // subscribedUser의 모든 사람들에 대해 찾음
                .populate('writer')
                .exec((err, videos) => {
                    if(err)
                        return res.status(400).send(err);
                    return res.status(200).json({ success: true, videos })
                })

        })

    
    
    
});



router.post("/getVideoDetail", (req, res) => {

    // const video = new Video(req.body.videoId)

    Video.findOne({ "_id": req.body.videoId })
        .populate('writer') // 유저의 모든 정보 가져옴
        .exec((err, videoDetail) => {
            if(err)
                return res.status(400).send(err);
            res.status(200).json({ success: true, videoDetail })
        })
    
});



router.post("/uploadfiles", (req, res) => {

    // 비디오를 서버에 저장
    upload(req, res, (err) => {
        if (err) {
            return res.json({ success: false, err })
        }
        return res.json({ success: true, filePath: res.req.file.path, fileName: res.req.file.filename })
    })

});


router.post("/thumbnail", (req, res) => {
    // 썸네일 생성 -> 비디오 러닝타임 가져오기

    let filePath = ""
    let fileDuration = ""

    
    // 비디오 정보 가져오기
    ffmpeg.ffprobe(req.body.filePath, function (err, metadata) {
        console.dir(metadata);
        console.log(metadata.format.duration);

        fileDuration = metadata.format.duration
    });


    // 썸네일 생성
    ffmpeg(req.body.filePath)    // req.body.url : 비디오 저장 경로
    .on('filenames', function (filenames) {     // 비디오 썸네일 파일이름 생성
        console.log('Will generate ' + filenames.join(', '))

        thumbsFilePath = 'uploads/thumbnails/' + filenames[0]
    })
    .on('end', function () {        // 썸네일 생성 후
        console.log('Screenshots taken');
        return res.json({ success: true, thumbsFilePath: thumbsFilePath, fileDuration: fileDuration })
    })
    .on('error', function (err) {
        console.error(err);
        return res.json({ success: false, err });
    })
    .screenshots({
        // Will take screenshots at 20%, 40%, 60%, 80% of the video
        count: 3,                               // 찍을 썸네일 갯수
        folder: 'uploads/thumbnails',
        size: '320x240',
        //'%b' : input basename (filename w/o extension)
        filename: 'thumbnail-%b.png'
    })


});

module.exports = router;
