const express = require('express');
const expressLayouts = require('express-ejs-layouts');

const { body, validationResult, check } = require('express-validator');
const methodOverride = require('method-override');

const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

require('./utils/db');
const Contact = require('./model/contact');

const app   = express();
const port  = 3000;

//setup method override
app.use(methodOverride('_method'));

//gunakan ejs
app.set('view engine', 'ejs');

//Third Party Middleware
app.use(expressLayouts);

//build in middleware
app.use(express.static('public'));

app.use(express.urlencoded({ extended: true }));

//konfigurasi flash
app.use(cookieParser('secret'));
app.use(
    session({
        cookie: { maxAge: 6000 },
        secret: 'secret',
        resave: true, 
        saveUninitialized: true,
    })
);
app.use(flash());

//halaman home
app.get('/', (req, res) => {
    const mahasiswa = [
        {
            nama: 'Wiwin Savitri',
            email: 'wiwinsavitri@gmail.com'
        },
        {
            nama: 'Indra',
            email: 'indra@gmail.com'
        },
        {
            nama: 'Oklan',
            email: 'oklan@gmail.com'
        },
    ]

    res.render('index', { 
        nama: 'Wiwin', 
        title: 'Home',
        mahasiswa,
        layout: 'layouts/main-layout',
    });
});

//halaman form tambah data kontak
app.get('/contact/add', (req, res) => {
    res.render('add-contact', {
        title: 'Form tambah data kontak',
        layout: 'layouts/main-layout'
    });
});

//halaman about
app.get('/about', (req, res) => {
    res.render('about', { 
        layout: 'layouts/main-layout',
        title: 'Halaman About' 
    });
});

//proses tambah data kontak
app.post('/contact', [
    body('nama').custom( async (value) => {

        const duplikat = await Contact.findOne({ nama: value });

        if(duplikat){
            throw new Error('Nama contact sudah digunakan!');
        }
        return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No Hp tidak valid!').isMobilePhone('id-ID')
], (req, res) => {
const errors = validationResult(req);
if(!errors.isEmpty()){
    res.render('add-contact', {
        title: 'Form Tambah Data Contact',
        layout: 'layouts/main-layout',
        errors: errors.array(),
    });
} else {
    Contact.insertMany(req.body, (error, result) => {
        //kirimkan flash message
        req.flash('msg', 'Data contact berhasil ditambahkan!')
        res.redirect('/contact')
    })
}

// console.log(req.body);
// res.send(req.body);
// addContact(req.body);
// res.redirect('/contact');
});

//proses delete contact
// app.get('/contact/delete/:nama', async (req, res) => {
//     const contact = await Contact.findOne({ nama: req.params.nama });

//     if(!contact){
//         res.status(404);
//         res.send('<h1>404</h1>')
//     }
//     else
//     {
//         Contact.deleteOne({ _id: contact._id }).then((result) => {
//             req.flash('msg', 'Data contact berhasil dihapus!');
//             res.redirect('/contact');
//         });
//     }
// });

app.delete('/contact', (req, res) => {
    const idnama = req.body.nama;
    
    Contact.deleteOne({ nama: idnama }).then((result) => {
        req.flash('msg', 'Data contact berhasil dihapus!');
        res.redirect('/contact');
    });
});

//halaman ubah contact
app.get('/contact/edit/:nama', async (req, res) => {
    const contact = await Contact.findOne({ nama: req.params.nama });

    res.render('edit-contact', {
        title: 'Form ubah data kontak',
        layout: 'layouts/main-layout',
        contact,
    });
});

//halaman kontak
app.get('/contact', async (req, res) => 
{
    // Contact.find().then((contact) => {
    //     res.send(contact);
    // });

    const contacts = await Contact.find();

    // const contacts = loadContact();
    // console.log(contacts);

    res.render('contact', { 
        layout: 'layouts/main-layout',
        title: 'Halaman Contact',
        contacts,
        msg: req.flash('msg'),
     });
});

//proses ubah data
app.put('/contact', [
    body('nama').custom(async (value, { req }) => {
        const duplikat = await Contact.findOne({nama: value});
        if( value !== req.body.oldNama && duplikat){
            throw new Error('Nama contact sudah digunakan!');
        }
        return true;
    }),
        check('email', 'Email tidak valid!').isEmail(),
        check('nohp', 'No Hp tidak valid!').isMobilePhone('id-ID')
    ], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        res.render('edit-contact', {
            title: 'Form Ubah Data Contact',
            layout: 'layouts/main-layout',
            errors: errors.array(),
            contact: req.body,
        });
    } else {
        Contact.updateOne(
            { _id: req.body._id},
            {
                $set:{
                    nama: req.body.nama,
                    email: req.body.email,
                    nohp: req.body.nohp,
                },
            }
        ).then((result) => {
            //kirimkan flash message
            req.flash('msg', 'Data contact berhasil diubah!')
            res.redirect('/contact')
        });
    }
});

//halaman detail kontak
app.get('/contact/:nama', async (req, res) => {
    const contact = await Contact.findOne({nama: req.params.nama});

    res.render('detail', { 
        layout: 'layouts/main-layout',
        title: 'Halaman Detail',
        contact,
     });
});

app.listen(port, () => {
    console.log(`Mongo Contact App | listening at http://localhost:${port}`);
});