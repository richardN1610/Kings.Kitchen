require('dotenv').config({ path: '.env' })

const express = require('express');
const app = express();
const stripeSKey = process.env.stripeSKey;  //stripe secret key
const stripePKey = process.env.stripePKey;  //stripe public key
const fs = require('fs');
const stripe = require('stripe')(stripeSKey)

//setting up view with ejs
app.set('view engine', 'ejs');
app.use(express.json());    //telling express that this will be using json so we can access json from the body
app.use(express.static('Web')); //using files from the web folder

//creating a route, getting a request and response 
app.get('/index', function (req, res) {
    //reading the json file
    fs.readFile('items.json', function (error, data) {    //create a function and check for error
        if (error) {
            res.status(500).end();
        } else {
            //if no error, pass the file
            res.render('index.ejs', {
                //sending stripe public key
                STRIPEPKEY: stripePKey,
                items: JSON.parse(data) //parse the json data to items
            }) //using the values from the server on the index.html, need to use ejs instead
        }
    })
})

//this is telling the server that how much the app will be charging the user
app.post('/purchase',function(req,res){
    //reading the json file
    fs.readFile('items.json',function(error, data){    //create a function and check for error
        if(error){
            res.status(500).end();
        }else{
            //converting json data to an object
            const itemsJson = JSON.parse(data);
            const itemArray = itemsJson.Menu;    //assign items from json Menu to an array
            let total =0;
            
            req.body.items.forEach(function(item){
                const itemJson = itemArray.find(function(i){   //finding the item in the array
                   return i.id == item.id; //returning the id from the item
                    //if the id on the iq matches the id on the request then it will output the json for that item
                })
                total = total  + itemJson.price * item.quantity;  //getting the total amount 
            })

            stripe.charges.create({ //.create will return a promise.
                amount: total,
                source: req.body.stripeTokenID
            }).then(function(){ //if promise returns success
                console.log("charged success");
                res.json({message: 'Order completed'})        //sending json back to the front-end
            }).catch(function(){
                console.log("Charge failed");
                res.status(500).end();
            })
        }
    })
})

//listen to port 3000
app.listen(3000);