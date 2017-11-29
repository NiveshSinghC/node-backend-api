const express = require('express');
const router = express.Router();
const Customer = require('./models/customer');

//customer wishlist 
router.post('/customer_wishlist',(req, res) =>{
    
    let wishlistitem = req.body.item;

    let data = {
            $push: {
                wishlist: wishlistitem
            }
        }

        let query = { _id: req.body.id }
        Customer.update(query, data, (err, set) => {
            if (err) {
                res.json({
                    success: false,
                    msg: err
                });
            }
            if (set) {
                res.json({
                    success: true,
                    msg: set
                });
            }
        });


});

//customer get historybuy 
router.post('/buyhistory',(req, res) =>{
    
    let custid = req.body.id;
    Customer.GET(custid,{historybuy:1}, (err, customer) => {
        if (err) {
            res.json({
                success: false,
                err: err
            })
        }
        if (customer) {
            res.json({
                success: true,
                wishlistItems: customer.historybuy
            });
        }
    });   
});

//customer historybuy 
router.post('/customer_buyhistory',(req, res) =>{
    
    let item = req.body.item;

    let data = {
        $push: {
            historybuy: item
        }
    }

    let query = { _id: req.body.id }
    Customer.update(query, data, (err, set) => {
        if (err) {
            res.json({
                success: false,
                msg: err
            });
        }
        if (set) {
            res.json({
                success: true,
                msg: set
            });
        }
    });
});

//updating client profile details 
router.post('/customer_profile_update', (req, res) => {
    // res.json({msg:req.body.id});
    let query = { _id: req.body.id }
    if(req.body.set == 'password'){
        var set$ = req.body.pram;
    }else{
        var set$ = JSON.parse('{"'+ req.body.set +'": "'+ req.body.pram +'" }')
    }
    let set = {
        $set : set$
    }
    // res.json(set)
    Customer.update(query, set, (err, rst) => {
        if(err){
            res.json({
                success: false,
                err: err
            });
        }
        if(rst){
            res.json({
                success: true,
                msg: rst
            });
        }
    })

});

module.exports = router;