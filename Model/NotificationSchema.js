const mongoose=require('mongoose');

const NotificationSchema=new mongoose.Schema({
    restroId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant'},
    message: { type: String, required: true },
    type: {type:String , enum:["order","query"] ,default:""},
    isRead: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model('notfication', NotificationSchema);

