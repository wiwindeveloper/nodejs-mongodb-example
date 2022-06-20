const mongoose = require('mongoose'); 

mongoose.connect('mongodb://127.0.0.1:27017/wpu', {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
});

//membuat schema
// const Contact = mongoose.model('Contact', {
//     nama: {
//         type: String,
//         required: true,
//     },
//     nohp: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//     },
// });

//menambahkan 1 data
// const contact1 = new Contact({
//     nama: 'Wiwin Savitri',
//     nohp: '08944534354',
//     email: 'wiwinsavitri@gmail.com',
// });

// //simpan ke collection
// contact1.save().then((contact) => console.log(contact));