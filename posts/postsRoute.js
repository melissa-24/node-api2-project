const express = require("express");

const db = require("../data/db");

const router = express.Router();

router.post("/", (req, res) => {
    const newPost = req.body

    if(!(newPost.title && newPost.contents)) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    } else {
        db.insert(newPost).then(post => {
            newPost.id = post.id;
            res.status(201).json(newPost);
        })
        .catch(err => {
            res.status(500).json({ error: "There was an error while saving the post to the database" })
        })
    }
});

router.post("/:id/comments", (req, res) => {
    const id = req.params.id;
    const newComment = req.body;
    newComment.post_id = id;

    if(!newComment.text) {
        res.status(400).json({ errorMessage: "Please provide a text for the comment." });
    } else {

        db.findById(id)
            .then(post => {
                if(post.length > 0) {
                    return post[0];
                } else {
                    res.status(404).json({ message: "The post with the specified ID does not exist." });
                }
            })
            .then(post => {                

                db.insertComment(newComment)
                    .then(comment => {
                        return comment.id;
                    })
                    .then(commentId => {
                        db.findCommentById(commentId)
                            .then(comment => res.status(200).json(comment))
                            .catch(() => res.status(500).json({ error: "There was an error retrieving the new comment" }));
                    })
                    .catch(() => res.status(500).json({ error: "There was an error while saving the comment to the database" }));
            })
            .catch(() => res.status(500).json({ error: "There was an error retrieving the post from the database" }));
    }
});

router.get("/", (req, res) => {
    db.find()
        .then(posts => {
            res.status(200).json(posts);
        })
        .catch(err => {
            res.status(500).json({ error: "The posts information could not be retrieved." })
        });
});

router.get("/:id", (req, res) => {
    const id = req.params.id;

    db.findById(id) 
        .then(post => {
            if(post.length == 0) {
                res.status(404).json({ message: "The post with the specified ID does not exist." })
            } else {
                res.status(200).json(post[0]);
            }
        })
        .catch(err => {
            res.status(500).json({ error: "The post information could not be retrieved." });
        });
});

router.get("/:id/comments", (req, res) => {
    const id = req.params.id;

    db.findById(id)
        .then(post => {
            if(post.length > 0) {
                return post[0];
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .then(post => {
            if(post) {
                db.findPostComments(post.id)
                    .then(comments => {
                        res.status(200).json(comments);
                    })
                    .catch(() => res.status(500).json({ error: "The comments information could not be retrieved." }));
            }
        })
        .catch(() => res.status(500).json({ error: "The post for the comment could not be retrieved." }));

});

router.put("/:id", (req, res) => {
    const id = req.params.id;
    const changes = req.body;
    changes.id = id;

    if(!(changes.title || changes.contents)) {
        res.status(400).json({ errorMessage: "Please provide title and contents for the post." });
    } else {

        db.findById(id).then(post => {
            if(post.length > 0) {
                db.update(id, changes).then(count => {
                    if(count > 0) {
                        res.status(200).json(changes);
                    } 
                })
                .catch(() => res.status(500).json({ error: "The post information could not be modified." }));
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .catch(err => {
            res.status(500).json({ error: "The post information could not be retrieved." });
        });
    }
});

router.delete("/:id", (req, res) => {
    const id = req.params.id;

    db.findById(id)
        .then(post => {
            if(post.length > 0) {
                return post[0];
            } else {
                res.status(404).json({ message: "The post with the specified ID does not exist." });
            }
        })
        .then(post => {
            db.remove(post.id)
                .then(() => {
                    res.status(200).json(post);
                })
                .catch(() => res.status(500).json({ error: "The post could not be removed" }))
        })
        .catch(() => res.status(500).json({ error: "There was an error retrieving the post." }))
});

module.exports = router;