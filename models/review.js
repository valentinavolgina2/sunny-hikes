const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    body: String,
    rating: Number,
    date: Date,
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
})

reviewSchema.virtual('formatDate').get(function () { 
    
    const offset = this.date.getTimezoneOffset();
    const date = new Date(this.date.getTime() - (offset * 60 * 1000));
    return date.toLocaleDateString("en-US"); //date.toISOString().split('T')[0];
    
})

module.exports = mongoose.model('Review',reviewSchema);