// implement your posts router here
const express = require("express");
const Post = require("./posts-model");
const router = express.Router();

//GET all posts
router.get("/", (req, res) => {
    Post.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(error => {
            console.log("GET /API/POSTS", error)
            res.status(500).json({  message: "The posts information could not be retrieved"})
        })
})

//Get posts by id
router.get("/:id", (req, res) => {
    Post.findById(req.params.id)
        .then(posts => {
            if(posts){ res.status(200).json(posts); }
            else{res.status(404).json({message: "The post with the specified ID does not exist"})}
        })
        .catch(error => {
            console.log("GET /:id", error)
            res.status(500).json({  message: "The posts information could not be retrieved"})
        })
})

router.post("/", (req,res) => {
    const {title, contents} = req.body;
    if (!title || !contents) {
        res.status(400).json({
            message: "Please provide title and contents for the post"})
    }
    else {
        Post.insert({title, contents})
            .then(({id}) =>{return Post.findById(id)})
            .then(posts => {res.status(201).json(posts)})
            .catch(error =>{
                res.status(500)
                    .json({
                        error: error.message,
                        message: "There was an error while saving the post to the database",
                    })
            })
    }
})

//Put: update the posts
router.put("/:id", (req,res) =>{
    const {title, contents} = req.body;
    if (!title || !contents) {
        res.status(400).json({message: "Please provide title and contents for the post"})}
    else{
        Post.findById(req.params.id)
            .then(posts => {
                if(!posts){
                    res.status(404).json({message: "The post with the specified ID does not exist"})
                }
                else{return Post.update(req.params.id, req.body)}
            })
            .then(postData => {if(postData) { return Post.findById(req.params.id, req.body)}})
            .then(morePostData => {if(morePostData) {res.json(morePostData)}})
            .catch(error => {
                console.log(error)
                res.status(500).json({message: "The post information could not be retrieved"})
            })
    }
})

//Delete, pass in the id
router.delete("/:id", async (req,res) =>{
    try{
        const post = await Post.findById(req.params.id)
        if (!post){res.status(404).json({ message: "The post with the specified ID does not exist" })}
        else{
            await Post.remove(req.params.id)
            res.json(post)
        }
    }
    catch(error) {res.status(500).json({message: "The post could not be removed", error: error.message})}
})

//Get the comments by id
router.get("/:id/messages", async (req,res) =>{
    try{
        const post = await Post.findById(req.params.id)
        if (!post){res.status(404).json({ message: "The post with the specified ID does not exist" })}
        else{
            const messages =  await Post.findPostComments(req.params.id)
            res.json(messages)
        }
    }

    catch(error) {
        res.status(500).json({
            message: "The comments information could not be retrieved", error: error.message
        })
    }
})
//Export server
module.exports = router ;