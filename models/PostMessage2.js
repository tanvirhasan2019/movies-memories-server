import mongoose from 'mongoose';
import  Schema from 'mongoose';

const postSchema2 = mongoose.Schema({
    title: String,
    message: String,
    name: String,
    creator: String,
    comment: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
      }],
    createdAt: {
        type: Date,
        default: new Date(),
    },
})

var PostMessage2 = mongoose.model('PostMessage2', postSchema2);

export default PostMessage2;