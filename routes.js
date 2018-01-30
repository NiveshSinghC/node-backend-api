const express = require('express');
// const publicIp = require('public-ip');
const router = express.Router();
const config = require('./config/database');

// required modules
// const url = require('url');
// const nodeID = require('node-machine-id');
const uniqid = require('uniqid');
// const conv = require('binstring');
// const aes = require('crypto-js/aes');
const sha512 = require('crypto-js/sha512');
// const sha256 = require('crypto-js/sha256');
// const emailExists = require('email-exists');
const validator = require('validator');
// const emailCheck = require('email-check');
// const expressValidator = require('express-validator');
// const multer = require('multer');
// const jwt = require('jsonwebtoken');
// const passport = require('passport');
const request = require("request");
// const jsdom = require("jsdom");
// const window = jsdom.jsdom().parentWindow;
// const cookies = require('cookies-js')(window);
const hash = require('./hash');
const RegexStrGen = require('./genRegexString'); 
const { itemLimit } = require('./config/constants');
//Models
const User = require('./models/user');
const Category = require('./models/category');
const Customer = require('./models/customer');
const Seller = require('./models/shopsaccount');
const Combine = require('./models/combineOrder');
const Frontpage = require('./models/frontPage');

// Register
router.get('/category', (req, res, next) => {
    Category.category((err, category) => {
        if (err) {
            console.log(err)
        }
        if (category) {
            console.log(category);
            res.json({
                category: category
            });
        }
    });
});

// Unique Indentity of the client computer or device
router.get('/UniqueIdentifier', (req, res) => {

    res.json({
        UniqueId: nodeID.machineIdSync({ original: true })
    });

});

//email existence check route
router.post('/postsubmit', (req, res) => {
    let email = req.body.email;
    
    let validate = validator.isEmail(email);

    if (validate) {

        let data = {
            $push: {
                review: {
                    custreview: req.body.review,
                    custemail: req.body.email,
                    custname: req.body.name
                }
            }
        }

        let query = { _id: req.body.id }

        User.update(query, data, (err, set) => {
            if (err) {
                res.json({
                    success: false,
                    msg: 'TECHNICAL_ERROR'
                });
            }
            if (set) {
                res.json({
                    success: true,
                    msg: set
                });
            }
        });
    } else {
        res.json({
            success: false,
            err: 'UNVALID_EMAIL_FORMAT'
        });
    }

});

// all product
router.get('/product', (req, res, next) => {

    User.product((err, product) => {
        if (err) throw err;
        if (product) {
            res.json({
                success: true,
                product: product
            });
        }
    });

});

router.get('/frontpage', (req,res) => {

    Frontpage.find()
    .exec((err, data) => {
        res.json({
            success: true,
            data: data
        });
    });
});

// all product
router.post('/subcatallproduct', (req, res, next) => {
    let subcat = req.body.subcat;
    let page= req.body.page;
    let limit = 30;
    User.count(subcat,(err, count) => {
        User.subcatproducts(subcat, page, limit, (err, product) => {
            if (err) {
                res.json({success: false,
                msg: err});
            }
            if (product) {
                res.json({
                    success: true,
                    product: product,
                    totalPage: count/limit
                });
            }
        });
    })

});

// subcat of cat
router.post('/catsubcat', (req, res, next) => {
    let cat = req.body.cat;
    Category.GiveCatDet(cat,{subcat:1}, (err, subcat) => {
        if (err) {
            res.json({success: false,
            msg: err});
        }
        if (subcat) {
            res.json({
                success: true,
                subcat: subcat.subcat
            });
        }
    });

});

//  cat of subcat
router.post('/catofsubcat', (req, res, next) => {
    let subcat = req.body.subcat;
    Category.find({'subcat.0': { 'name': subcat}}, {name:1}, (err, cat) => {
        if (err) {
            res.json({success: false,
            msg: err});
        }
        if (cat) {
            res.json({
                success: true,
                cat: cat[0].name
            });
        }
    });

});

// ==========================================SEARCH FILTERS==============================\\
router.post('/searchquery/filter', (req, res) => {
    let sq = RegexStrGen.GenRegexQueryString(req.body.query);

    const getShopnames = User.distinct('shopname',{ name: { $regex: sq, "$options": 'i' } }).exec();
    const getSubCats = User.distinct('subcategory',{ name: { $regex: sq, "$options": 'i' } }).exec();

    Promise.all([getShopnames, getSubCats])
    .then(callback => {
        res.json({
            success: true,
            shopname: callback[0],
            subcategory: callback[1]
        });
    });
});

//sorting via shopname 
router.post('/searchquery/filter_data/shopname', (req, res) => {
    let keywords = RegexStrGen.GenRegexQueryString(req.body.query);
    let shopname = req.body.shopname;
    let pageno = req.body.pageno;
    const query = {name: { $regex: keywords, $options: 'i' }, shopname: shopname};

    User.countPage(query)
    .then(count => {
        User.find(query)
        .skip(pageno*itemLimit)
        .limit(itemLimit)
        .exec((err, shpname) => {
            if (err) {
                res.json({
                    success: false,
                    msg: err
                });
            }
            if (shpname) {
                res.json({
                    success: true,
                    data: shpname,
                    totalPage: count/itemLimit
                });
            }
        });
    })
    .catch(err => {
        res.json({
            success: false,
            msg: err
        });
    });
});

// for sorting via price
router.post('/searchquery/filter_data/price', (req, res) => {
    let keywords = RegexStrGen.GenRegexQueryString(req.body.query);;
    let how = req.body.how;
    let salePrice = req.body.lg;
    let pageno = req.body.pageno;

    if(salePrice && how){
        const query = {name: { $regex: keywords, $options: 'i' }, salePrice};

        User.countPage(query)
        .then(count => {
            User.find(query)
            .sort({salePrice: how})
            .skip(pageno*itemLimit)
            .limit(itemLimit)
            .exec( (err, shpname) => {
                if (err) {
                    res.json({
                        success: false,
                        msg: err
                    });
                }
                if (shpname) {
                    res.json({
                        success: true,
                        data: shpname,
                        totalPage: count/itemLimit
                    });
                }
            });
        });
    }else if(salePrice){
        const query = {name: { $regex: keywords, $options: 'i' }, salePrice};

        User.countPage(query)
        .then(count => {
            User.find(query)
            .skip(pageno*itemLimit)
            .limit(itemLimit)
            .exec((err, shpname) => {
                if (err) {
                    res.json({success: false,
                    msg: err});
                }
                if (shpname) {
                    res.json({
                        success: true,
                        data: shpname,
                        totalPage: count/itemLimit
                    });
                }
            });
        });
    }else{
        const query = {name: { $regex: keywords, $options: 'i' }};

        User.countPage(query)
        .then(count => {
            User.find(query)
            .sort({salePrice:how})
            .skip(pageno*itemLimit)
            .limit(itemLimit)
            .exec( (err, shpname) => {
                if (err) {
                    res.json({success: false,
                    msg: err});
                }
                if (shpname) {
                    res.json({
                        success: true,
                        data: shpname,
                        totalPage: count/itemLimit
                    });
                }
            });
        });
    }
});

// ==========================================SEARCH FILTERS==============================\\

//==================filtering and sorting routes=====start=======>
// for filtering by shopname getting shopname
router.post('/filter/subcat', (req, res) => {
    let subcat = req.body.subcat;
    User.distinct('shopname',{subcategory: subcat }, (err, shpname) => {
        if (err) {
            res.json({success: false,
            msg: err});
        }
        if (shpname) {
            res.json({
                success: true,
                shopname: shpname
            });
        }
    });

});

//sorting via shopname 
router.post('/filter_data/subcat/shopname', (req, res, next) => {
    let subcat = req.body.subcat;
    let shopname = req.body.shopname;
    let pageno = req.body.pageno;

    User.count({subcategory:subcat, shopname: shopname}, (error, count) => {

        if(error){
            if (error) {
                res.json({
                    success: false,
                    msg: error
                });
            }
        }else if (count){
            const cursor = User.find({subcategory:subcat, shopname: shopname});
        
            cursor.skip(pageno*itemLimit).limit(itemLimit).exec((err, shpname) => {
                if (err) {
                    res.json({success: false,
                    msg: err});
                }
                if (shpname) {
                    res.json({
                        success: true,
                        data: shpname,
                        totalPage: count/itemLimit
                    });
                }
            });
        }
    })
});

// for sorting via price
router.post('/filter_data/subcat', (req, res, next) => {
    let subcat = req.body.subcat;
    let how = req.body.how;
    let salePrice = req.body.lg;
    let pageno = req.body.pageno;

    if(salePrice && how){
        User.countPage({subcategory:subcat, salePrice }).then(count => {
            User.find({subcategory:subcat, salePrice }).sort({salePrice:how})
            .skip(pageno*itemLimit).limit(itemLimit).exec( (err, shpname) => {
                if (err) {
                    res.json({success: false,
                    msg: err});
                }
                if (shpname) {
                    res.json({
                        success: true,
                        data: shpname,
                        totalPage: count/itemLimit
                    });
                }
            });
        });
    }else if(salePrice){
        User.countPage({subcategory:subcat, salePrice }).then(count => {
            User.find({subcategory:subcat, salePrice })
            .skip(pageno*itemLimit).limit(itemLimit).exec((err, shpname) => {
                if (err) {
                    res.json({success: false,
                    msg: err});
                }
                if (shpname) {
                    res.json({
                        success: true,
                        data: shpname,
                        totalPage: count/itemLimit
                    });
                }
            });
        });
    }else{
        User.countPage({subcategory:subcat}).then(count => {
            User.find({subcategory:subcat}).sort({salePrice:how})
            .skip(pageno*itemLimit).limit(itemLimit).exec((err, shpname) => {
                if (err) {
                    res.json({
                        success: false,
                        msg: err
                    });
                }
                if (shpname) {
                    res.json({
                        success: true,
                        data: shpname,
                        totalPage: count/itemLimit
                    });
                }
            });
        });
    }
});


//==================filtering and sorting routes=====end=======>

//=====================customer cart routes=============start=====>
//customer cart 
router.post('/customer_cart',(req, res) =>{

    let custitem = req.body.item;

    let data = {
            $push: {
                cart: {
                    name: custitem.name,
                    imagename: custitem.imagename,
                    price: custitem.price,
                    saleprice: custitem.saleprice,
                    quantity: custitem.quantity,
                    shopname: custitem.shopname,
                    shopid: custitem.shopid,
                    id: custitem.id
                }
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
                    msg: true
                });
            }
        });


});

router.post('/customer_cart/delete_item',(req, res) =>{

    let index = req.body.index;
    // console.log("index",index);

    var itemodel = JSON.parse('{ "cart.'+index+'" : 1 }');
    let unset = {
            $unset: itemodel
        }
    let pull = {
            $pull: {
                "cart": null
            }
        }

        console.log("unset ",unset);

        let query = { _id: req.body.id }

        Customer.update(query, unset, (err, unst) => {
            if (err) {
                res.json({
                    success: false,
                    msg: err
                });
            }
            if (unst) {
                
                Customer.update(query, pull, (err, pul) => {
                    if (err) {
                        res.json({
                            success: false,
                            msg: err
                        });
                    }
                    if (pul) {
                        
                        res.json({
                            success: true,
                            msg: pul
                        });
                    }
                });
            }
        });


});

router.post('/customer_cart/clear_cart',(req, res) =>{

    let clear = { 
            $pull: { 
                    cart: {
                         $exists: true 
                     }
                 }
             }

        let query = { _id: req.body.id }

        Customer.update(query, clear, (err, clr) => {
            if (err) {
                res.json({
                    success: false,
                    msg: err
                });
            }
            if (clr) {
                        res.json({
                            success: true,
                            msg: clr
                        });
                    }
        });


});

//=====================customer cart routes=============end=====>

//===========================customer whistlist routes=========start======>
router.post('/wishlist', (req, res, next) => {
    
    let custid = req.body.id;

    Customer.getCustomerWishlist(custid, (err, customer) => {
        if (err) {
            res.json({
                success: false,
                err: err
            })
        }
        if (customer) {
            res.json({
                success: true,
                wishlistItems: customer.wishlist
            });
        }
    });


});

router.post('/customer_wishlist/delete_item',(req, res) =>{
    
    let index = req.body.index;
    // console.log("index",index);

    var itemodel = JSON.parse('{ "wishlist.'+index+'" : 1 }');
    let unset = {
            $unset: itemodel
        }
    let pull = {
            $pull: {
                "wishlist": null
            }
        }

        console.log("unset ",unset);

        let query = { _id: req.body.id }

        Customer.update(query, unset, (err, unst) => {
            if (err) {
                res.json({
                    success: false,
                    msg: err
                });
            }
            if (unst) {
                
                Customer.update(query, pull, (err, pul) => {
                    if (err) {
                        res.json({
                            success: false,
                            msg: err
                        });
                    }
                    if (pul) {
                        
                        res.json({
                            success: true,
                            msg: pul
                        });
                    }
                });
            }
        });


});

router.post('/customer_wishlist/clear_wishlist',(req, res) =>{
    
    let clear = { 
        $pull: { 
                wishlist: {
                        $exists: true 
                    }
                }
            }

    let query = { _id: req.body.id }

    Customer.update(query, clear, (err, clr) => {
        if (err) {
            res.json({
                success: false,
                msg: err
            });
        }
        if (clr) {
            res.json({
                success: true,
                msg: clr
            });
        }
    });
});

//===========================customer whistlist routes=========end======>

router.post('/customer', (req, res) => {

    let custid = req.body.id;

    Customer.getCustomerCart(custid, (err, customer) => {
        if (err) {
            res.json({
                success: false,
                err: err
            })
        }
        if (customer) {
            res.json({
                success: true,
                cartItems: customer.cart
            });
        }
    });


});

// Profile
router.post('/item', (req, res, next) => {

    let id = req.body.id;
    
    User.item(id, (err, item) => {
        if (err) {
            res.json({
                success: false,
                product: err 
            });
            console.log(err);
        }
        if (item) {
            res.json({
                success: true,
                product: item
            });
        }
    });
});

//register Client user route
router.post('/client_register', (req,res) => {
    let newuser;
    let NewRegistration = req.body;
    if(req.body.guser){
        NewRegistration['uidentity'] = uniqid('so-');
        newuser = new Customer(NewRegistration);
    }else{
        newuser = new Customer ({
            name: req.body.regname,
            uidentity: uniqid('so-'),
            contactno: req.body.regno,
            email: req.body.regemail,
            password : req.body.regpassword
        });
    }
    Customer.addCustomer(newuser, (err, acc) => {
        if (err) {
            res.json({
                success: false,
                msg: err
            });
        }
        if (acc) {
            res.json({
                success: true,
                msg: acc
            })
        }
    });
    
});

// check google user is register
router.post('/check_g_user', (req, res) => {
    const gid = req.body.gid;
    Customer.findOne({gid: gid}, (err, exist) => {
        if(err){
            res.json({
                success: false,
                err: err
            });
            console.log(err);
        }else if(exist) {
            res.json({
                success: true,
                exist: exist
            });
        }else {
            res.json({
                success: true,
                exist: false
            });
        }
    })
});

//Login Client user route
router.post('/client_login', (req,res) => {
    let pwd = sha512(req.body.password).toString();

    var email = sha512(req.body.email).toString();

    
    // console.log(email,pwd);

    Customer.getCustomer(email, (err, cust) => {
                if (err) {
                    // console.log('err')
                    res.json({
                        success: false,
                        msg: err
                    });
                }
                else if(cust){
                    // console.log(cust);
                    
                    if(cust.password == pwd){
                        res.json({
                            success: true,
                            msg: cust
                        });
                    }else{
                        res.json({
                            success: false,
                            msg: 'PASSWORD_NOT_MATCH'
                        })
                    }
                }else{
                    res.json({
                        success: false,
                        msg: 'EMAIL_NOT_EXIST'
                    });
                }
            });
    
});

//search route
router.post('/search', (req, res) => {
    const keywords = req.body.name;
    const pageno = req.body.pageno ? req.body.pageno : 0;
    const proj = req.body.projection;
    const limit = req.body.pageno == undefined ? 15 : itemLimit ;
    
    const regex = RegexStrGen.GenRegexQueryString(keywords);
    const query = { "name": { "$regex": regex, "$options": 'i' } }

    User.countPage(query).then(count => {
        User.search(query, proj)
        .skip(pageno*limit).limit(limit)
        .exec((err, searchResult) => {
            if (err) {
                res.json({
                    success: false,
                    msg: err
                });
            }
            if (searchResult) {
                res.json({
                    success: true,
                    product: searchResult,
                    totalPage: count/limit,
                    totalMatch: req.body.pageno ? undefined : count
                });
            }
        });
    })
    .catch(err => {
        res.json({
            success: false,
            err: err
        });
    });
});

//seller orders route
router.post('/seller_orders', (req, res) => {

    let data = {
            $push: {
                Todo: req.body.order
            }
        }

        let query = { _id: req.body.shopname }

        Seller.update(query, data, (err, ord) => {
            if (err) {
                res.json({
                    success: false,
                    msg: err
                });
            }
            if (ord) {
                res.json({
                    success: true,
                    msg: ord
                });
            }
        });
});

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

router.post('/combineorder', (req, res) => {

    let combineorder = new Combine ({
        orderid: req.body.order.orderid ,  
        buyname: req.body.order.buyname ,  
        buyconno: req.body.order.buyconno ,  
        buyadd: req.body.order.buyadd ,  
        orderdate: req.body.order.orderdate ,  
        product:                                                                
        {
            id: req.body.order.product.id ,  
            name: req.body.order.product.name ,  
            quantity: req.body.order.product.quantity ,  
            price: req.body.order.product.price ,  
            shopname: req.body.order.product.shopname ,  
            shopid: req.body.order.product.shopid
        }
    });

    Combine.NewOrder(combineorder, (err, ord) => {
        if (err) {
            res.json({
                success: false,
                msg: err
            });
        }
        if (ord) {
            res.json({
                success: true,
                // msg: ord
            });
        }
    });
});

router.get('/get-combineorder', (req, res) => {

    let query = {
        "status": 'proccessing'
    };

    Combine.GetOrders((err, ords) => {
        if(err){
            res.json({
                success: false,
                msg: err
            });
        }
        if(ords){
            res.json({
                success: true,
                msg: ords
            });
        }
    }, query);
});

router.get('/get_dispatched_order', (req, res) => {

    let query = {
        "status": 'dispatched'
    }

    Combine.GetOrders((err, ords) => {
        if(err){
            res.json({
                success: false,
                msg: err
            });
        }
        if(ords){
            res.json({
                success: true,
                msg: ords
            });
        }
    }, query);
});

router.post('/getshopaddress', (req, res) => {
    const id = req.body.shopid;
    
    const params = {
        _id: 0,
        ShopAddress: 1,
        Password: 1
    }
    Seller.GetShopAdd(id, params, (err, add) => {
        if(err){
            res.json({
                success: false,
                msg: err
            });
        }
        if(add){
            const msg = {
                ShopAddress: hash.AESHashDecryptOnlyOne(add.Password, add.ShopAddress)
            };

            res.json({
                success: true,
                msg: msg
            });
        }
    });
});

router.post('/update_order_status', (req, res) => {
    
    Combine.UpdateStatus(req.body.orderid, req.body.status, (err, sts) => {
        if(err){
            res.json({
                success: false,
                msg: err
            });
        }
        if(sts){
            res.json({
                success: true,
                msg: sts
            });
        }
    });
});

router.post('/move_completed_order', (req, res) => {

    let query1 = {
        _id: req.body.order.product.shopid
    };
    let query2 = {
        orderid: req.body.order.orderid
    };

    let push = {
        $push: {
            HistorySales: req.body.order
        }
    };

    Seller.update(query1, push, (err, dat) => {
        if(err){
            res.json({
                success: false,
                msg: err
            });
        }
        if(dat){
            Combine.remove(query2, (err, suc) => {
                if(err){
                    res.json({
                        success: false,
                        msg: err
                    });
                }
                if (suc) {
                    res.json({
                        success: true,
                        msg: dat
                    });
                }
            })
        }
    })
});

//Product add route (POST)
router.post('/cms/product_add', (req, res) => {
    // console.log(JSON.parse(req.cookies.useracc)._id)
    // res.send(req.body.prprice);
    req.checkBody('prname', 'Name is required').notEmpty();
    // req.checkBody('prsdesc', 'Short Dscription is required').notEmpty();
    // req.checkBody('prfdesc', 'Full Description is required').notEmpty();
    // req.checkBody('prft', 'Profit is required').notEmpty();
    req.checkBody('prctg', 'Category is required').notEmpty();
    req.checkBody('prsubctg', 'Sub Category Price is required').notEmpty();
    req.checkBody('prprice', 'Price is required').notEmpty();
    req.checkBody('prslprice', 'Sale Price is required').notEmpty();
    req.checkBody('prstock', 'Stock is required').notEmpty();

    /*if (req.files[0] == undefined) {
        req.checkBody('primage', 'Image is required').notEmpty();
    }*/
    if(req.body.prctg === 'Clothings'){
        req.checkBody('prsize', 'Size is required').notEmpty();
    }
	if (req.files.primage == undefined) {
        req.checkBody('primage', 'Image is required').notEmpty();
    }

    let errors = req.validationErrors();

    if (errors) {
        
        // Category.category((err, category) => {
        //     if (err) {
        //         throw err;
        //     } else {
                res.json({
                    errors: errors
                    // cookie: JSON.parse(req.cookies.useracc),
                    // cat: category
                });
            // }
        // });

    } else {
	var filename = Date.now()+'.jpg';
		// var options = { 
        //     method: 'POST',
        //     url: 'http://127.0.0.1:5500/upload',
	    //   	formData: {
		// 		upfile: {
        //        		value: req.files.primage.data,
		// 			options: {
    	// 				filename: filename, //req.files.primage.name,
		// 				contentType: req.files.primage.mimeType
		// 			}
		// 		}						
		// 	} 
		// };
        if(req.files.primage){
            // console.log(JSON.parse(req.cookies.useracc).ShopName);
            var file = req.files.primage,
              name = file.name,
              type = file.mimetype;
            var uploadpath = __dirname + '/images/' + filename;
            file.mv(uploadpath,function(err){
                if(err){
                console.log("File Upload Failed",name,err);
                res.send("Error Occured!");
                }
                else {
                    //res.json(body);
                    let item = new User({
                        name: req.body.prname,
                        //imageName: req.files[0].filename,
                        imageName: filename,
                        // shortDescription: req.body.prsdesc,
                        // fullDescription: req.body.prfdesc,
                        // features: req.body.prft,
                        category: req.body.prctg,
                        shopid : JSON.parse(req.cookies.useracc)._id,
                        shopname: req.body.shname, // hash.AESHashDecryptOnlyOne(JSON.parse(req.cookies.useracc).conn,req.body.shname),    // JSON.parse(req.cookies.useracc).ShopName ---------use this for getting shopname from cookies
                        shopadd: req.body.shadd, // hash.AESHashDecryptOnlyOne(JSON.parse(req.cookies.useracc).conn,req.body.shadd),
                        subcategory: req.body.prsubctg,
                        price: parseInt(req.body.prprice),
                        salePrice: parseInt(req.body.prprice - ((req.body.prslprice / 100) * req.body.prprice)).toString(),
                        discount: req.body.prslprice,
                        stock: req.body.prstock,
                    });
                    if(req.body.prsdesc){
                        item['shortDescription'] = req.body.prsdesc;
                    }
                    if(req.body.prfdesc){
                        item['fullDescription'] = req.body.prfdesc;
                    }
                    if(req.body.prft){
                        item['features'] = req.body.prft;
                    }
                    if(req.body.prctg === 'Clothings'){
                        item['size'] = req.body.prsize;
                    }

                    // console.log(item)
                    User.addProduct(item, (err, item) => {
                        if (err) {
                            res.json({
                                success: false,
                                msg: err
                            });
                        }
                        if (item) {
                            res.json({
                                success: true,
                                msg: item
                            });
                        }
                    });
                            console.log("submit");
                } 
            });
          }
          else {
            res.send(false);
            res.end();
          };
        // request(options, function (error, response, body) {
        //     if (error){
        //         res.json({
        //             success: false,
        //             msg: error
        //         });
        //     };

        //     if(body){}
        // });
    }

});
module.exports = router;