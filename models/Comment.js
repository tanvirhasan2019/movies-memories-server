import mongoose from 'mongoose';


const CommentSchema = mongoose.Schema({
    
    message: String,
    createdAt: {
        type: Date,
        default: new Date(),
    },
    creator : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
     },
})

var Comment = mongoose.model('Comment', CommentSchema);

export default Comment;