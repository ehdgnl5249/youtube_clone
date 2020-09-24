const express = require('express');
const router = express.Router();
const { Like } = require("../models/Like");
const { DisLike } = require("../models/DisLike");


//=================================
//             Like
//=================================



router.post("/getLikes", (req, res) => {

    let variable = {}
    if (req.body.videoId) {
        variable = { videoId: req.body.videoId }
    } else {
        variable = { commentId: req.body.commentId }
    }

    console.log("############################## : ", variable);

    Like.Find(variable)
        .exec((err, likes) => {
            if (err) return res.status(400).send(err);
            res.status(200).json({ success: true, likes })
        })


})


router.post("/getDislikes", (req, res)=> {

    let variable = {}

    if(req.body.videoId) {
        variable = { videoId: req.body.videoId }
    } else {
        variable = { commentId: req.body.commentId }
    }

    DisLike.find(variable)
    .exec((err, dislikes) => {
        if (err)
            return res.status(400).send(err)
        res.status(200).json({ success: true, dislikes })
    }) 
})




module.exports = router;