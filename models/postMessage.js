import mongoose from 'mongoose';

const postSchema = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
     },
    tags: [String],
    selectedFile: String,
    likes: { type: [String], default: [] },
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }],
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

var PostMessage = mongoose.model('PostMessage', postSchema);

export default PostMessage;