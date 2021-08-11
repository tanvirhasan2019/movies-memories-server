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

   
    const {id } = req.params;
    const tags = req.body;
   

    try {

            const  posts = await PostMessage.find({ $and : [ {tags: { $all : tags }} ,{_id: {$ne: id}}]}).sort({ _id: -1 }).limit(4);
          //  find({ $or: [ { tags: { $in: [...tags] } } ]}){_id: {$ne: id}
                                           
            res.json({ data: posts});

             
    } catch (error) {    
        res.status(404).json({ message: error.message });
    }
}



export const getPostsBySearch = async (req, res) => {

   
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
                                    
       
        res.status(200).json(post);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}



export const createPost = async (req, res) => {
    const post = req.body;
   
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

    const newComment = new Comment({ message : message , creator: req.userId, createdAt: new Date().toISOString() })
    try {
        
        await newComment.save();

       
        var post = await PostMessage.findById(id);
       
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
       
        res.status(409).json({ message: error.message });
    }

};






export default router;