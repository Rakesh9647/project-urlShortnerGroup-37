const express = require('express');
const bodyParser = require('body-parser');
const route = require("./Route/route");
const {default:mongoose} = require('mongoose');
const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));


mongoose.connect("mongodb+srv://sumandev:aBosU15RXTGZYkKq@cluster0.4du2i.mongodb.net/group37data?retryWrites=true&w=majority" , {
    useNewUrlParser:true
})

.then( () =>console.log(" MONGO DB IS CONNECTED"))
.catch( err => console.log(err))


app.use('/', route);

app.listen(process.env.PORT || 3000, function() {
    console.log(" EXPRESS APP RUNNING ON PORT " +  (process.env.PORT || 3000));
});