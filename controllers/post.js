import express from 'express';
import mongoose from 'mongoose';

import PostMessage from '../models/postMessage.js';
import PostMessage2 from '../models/postMessage2.js';
import Comment from '../models/Comment.js';
import UserModal from "../models/user.js";


const router = express.Router();

export const getPosts = async (req, res) => {
    const { page } = req.query;
    
    try {
        const LIMIT = 8;

        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await PostMessage.countDocuments({});

        const posts = await (await PostMessage
                                            .populate({
                                                path: "comment",
                                                populate: [
                                                { 
                                                    path: 'creator',
                                                    select: ['_id', 'name', 'email']
                                                }
                                                ]
                                            })
                                            .find()
                                            .sort({ _id: -1 })
                                            .limit(LIMIT)
                                            .skip(startIndex));
                                                     
                                            
        res.json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}



export const RecommendedPost = async (req, res) => {

    console.log('Recommended post called');
    const {id } = req.params;
    const tags = req.body;
    console.log('tags ', {tags});
    console.log('id ', {id});

    try {

            const  posts = await PostMessage.find({ $and : [ {tags: { $all : tags }} ,{_id: {$ne: id}}]}).sort({ _id: -1 }).limit(4);
          //  find({ $or: [ { tags: { $in: [...tags] } } ]}){_id: {$ne: id}
                                           
            res.json({ data: posts});

             
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}



export const getPostsBySearch = async (req, res) => {

    console.log('search post called');
    const { searchQuery, page } = req.query;
    try {
        const title = new RegExp(searchQuery, "i");
        const LIMIT = 4;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
        const search = String(searchQuery);
          
        if( search.length > 0 ){

            const total = await PostMessage.countDocuments({$or: [ { title }, { tags: { $in: title } } ]});

            const  posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: title } } ]})
                                            .populate({
                                                path: "comment",
                                                populate: [
                                                { 
                                                    path: 'creator',
                                                    select: ['_id', 'name', 'email']
                                                }
                                                ]
                                            })
                                            
                                            .sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

            res.json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});

        }else{

            const total = await PostMessage.countDocuments({});

            const posts = await PostMessage.find()
                                            .populate({
                                                path: "comment",
                                                populate: [
                                                { 
                                                    path: 'creator',
                                                    select: ['_id', 'name', 'email']
                                                }
                                                ]
                                            })
                                            .sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

            res.json({ data: posts, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
        }        
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}



export const getPostdetails = async (req, res) => { 
    const { id } = req.params;

    try {
        const post = await PostMessage.findById(id)
                                    .populate({
                                        path: "comment",
                                        populate: [
                                        { 
                                            path: 'creator',
                                            select: ['_id', 'name', 'email', 'avatar']
                                        }
                                        ]
                                    }).populate({
                                        path: "creator",
                                        select: ['_id', 'name', 'email','avatar']
                                    });
                                    
       // console.log('post details ', post);
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}



export const createPost = async (req, res) => {
    const post = req.body;
    console.log('create post data ', post.title);

    const newPostMessage = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString() })

    try {
        await newPostMessage.save();

        res.status(201).json(newPostMessage);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
}

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const { title, message, creator, selectedFile, tags } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };

    await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });

    res.json(updatedPost);
}

export const deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    await PostMessage.findByIdAndRemove(id);

    res.json({ message: "Post deleted successfully." });
}


export const deleteComment = async (req, res) => {
    try{
        const { id } = req.params;
        console.log('Delete Comment is')
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No comment with id: ${id}`);
    
        await Comment.findByIdAndRemove(id);
    
        res.status(200).json({ message: "Post deleted successfully." });

    }catch(error){
       res.json({ message: "something went wrong." });
    }
    
}

export const likePost = async (req, res) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.json({ message: "Unauthenticated" });
      }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true }).populate({
                                            path: "comment",
                                            populate: [
                                            { 
                                                path: 'creator',
                                                select: ['_id', 'name', 'email', 'avatar']
                                            }
                                            ]
                                        }).populate({
                                            path: "creator",
                                            select: ['_id', 'name', 'email','avatar']
                                        });

    res.status(200).json(updatedPost);
}


export const likePosts = async (req, res) => {
    const { id } = req.params;

    if (!req.userId) {
        return res.json({ message: "Unauthenticated" });
      }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex((id) => id === String(req.userId));

    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }

    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });

    res.status(200).json(updatedPost);
}

export const commentPost = async (req, res) => {
    const { id } = req.params;
    const  {message}  = req.body;
    console.log('message ', message)

   
    const newComment = new Comment({ message : message , creator: req.userId, createdAt: new Date().toISOString() })
    console.log("newComment ", newComment);
    try {
        
        await newComment.save();

        console.log('new comment id ', newComment._id);
        var post = await PostMessage.findById(id);
        console.log('post find id  ', post);
        post.comment.push(newComment._id);

        const updatedPost = await (await PostMessage.findByIdAndUpdate(id, post, { new: true })
                                        .populate({
                                            path: "comment",
                                            populate: [
                                               { 
                                                   path: 'creator',
                                                   select: ['_id', 'name', 'email', 'avatar']
                                               }
                                            ]
                                          }));

        res.status(200).json({data : updatedPost});

    } catch (error) {
        console.log('error ', error);
        res.status(409).json({ message: error.message });
    }

};


/* export const createPost2 = async (req, res) => {
    const post = req.body;
  
    const newPostMessage = new PostMessage2({ ...post, creator: req.userId, createdAt: new Date().toISOString() })

    try {
        await newPostMessage.save();

        res.status(201).json(newPostMessage);
    } catch (error) {
        res.status(409).json({ message: error.message });
    }
};



export const commentPost2 = async (req, res) => {

     const { id } = req.params;
     const  message  = req.body;
    
     const newComment = new Comment({ ...message, creator: req.userId, createdAt: new Date().toISOString() })
     console.log("newComment ", newComment);

    try {
        
         await newComment.save();

       /*  await newComment.save()
            .then((result) => {
                PostMessage2.findById(id), (err, user) => {
                    if (user) {
                        // The below two lines will add the newly saved review's 
                        // ObjectID to the the User's reviews array field
                        user.comment.push(newComment);
                        user.save();
                        res.json({ message: 'post created!' });
                        }
            }}) */

       /* await newComment.save(function(error) {
            if (!error) {
                PostMessage2.findById(id)
                    .populate('creator')
                    .exec(function(error, commentss) {
                        console.log(JSON.stringify('comments save to database ', commentss, null, "\t"))
                    })
            } 
        }); 

          console.log('new comment id ', newComment._id);
          var post = await PostMessage2.findById(id);
          console.log('post find id  ', post);
          post.comment.push(newComment._id);
      //  var post = await PostMessage2.findById(id);
       // console.log('post read and add comment ', post);
      //  post.comment.add(newComment._id);
        // var x = post.comment ? [...post.comment] : [];

    

        const updatedPost = await (await PostMessage2.findByIdAndUpdate(id, post, { new: true }).populate('comment'));
      //  console.log("updatedPost ", {updatedPost});



        res.status(200).json({data : newComment , post: updatedPost});
    } catch (error) {
        console.log('error ', error);
        res.status(409).json({ message: error.message });
    }

};


export const getPostsNew = async (req, res) => {
    const { page } = req.query;
    
    try {
        const LIMIT = 8;
        const startIndex = (Number(page) - 1) * LIMIT; // get the starting index of every page
    
        const total = await PostMessage2.countDocuments({});
        //const posts = await PostMessage2.find().populate('comment.creator').sort({ _id: -1 }).limit(LIMIT).skip(startIndex);
        const posts = await PostMessage2.find()
                       .populate({
                        path: "comment",
                        populate: [
                           { 
                               path: 'creator',
                               select: ['_id', 'name', 'email']
                           }
                        ]
                      })
                       .sort({ _id: -1 }).limit(LIMIT).skip(startIndex);
        const comment2 = await Comment.find().populate('creator').sort({ _id: -1 }).limit(LIMIT).skip(startIndex);

        console.log('Posts data ', posts);

        res.json({ data: posts, comment : comment2, currentPage: Number(page), numberOfPages: Math.ceil(total / LIMIT)});
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}; */




export default router;