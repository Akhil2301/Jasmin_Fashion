const express = require('express');
const bodyParser = require('body-parser');
const {check, validationResult} = require('express-validator');
const userHelper = require('../helpers/user-helpers');
const productHelpers = require('../helpers/product-helpers');
const userHelpers = require('../helpers/user-helpers');
const sortHelper=require('../helpers/sort-helper');
const { response } = require('express');
var objectId = require('mongodb').ObjectId
//const createInvoiceHelp =require('../helpers/pdfgenerator')
// const dotenv=require('dotenv');
// dotenv.config({path:'./config/config.env'})



const router = express.Router();
const urlencodedParser = bodyParser.urlencoded({extended: false})


const accountSid =process.env.TWILIO_ACCOUNT_ID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
 const serviceid = process.env.TWILIO_SERVICE;
const client = require('twilio')(process.env.TWILIO_ACCOUNT_ID, process.env.TWILIO_AUTH_TOKEN);


const verifyLogin = async(req, res, next) => {
   
    if (req.session.loggedIn) {
        
        next();
    } else {
        
        res.redirect('/login')
    }
}

const cartcnt = (req, res, next) => {
    let user = req.session.user
    let cartCount = null;
    if (req.session.loggedIn) {
        userHelper.getCartCount(req.session.user._id).then((response) => {

            req.session.cartCount = response
            next();
        })
    } else {
        res.redirect('/login')
    }
}
/*Get Login Page. */
router.get('/404',async function (req, res) {
   res.render('error')

});
    
       
           
   
  


/* GET users listing. */
router.get('/', async function (req, res) { // console.log(req.body._id)
   // console.log(accountSid)

   try{
    headers=await userHelper.getHeader()
  
    cartCount = null
    if (req.session.loggedIn) {
        cartCount = await userHelper.getCartCount(req.session.user._id)
    }

    productHelpers.viewproduct().then(product => {
        if (req.session.user) {
            let a = product

            res.render('user/index', {a, cartCount, user: req.session.user,headers});

        } else if (! req.session.admin) {
            let a = product

            res.render('user/index', {a,headers});

        }
    })
}
catch{
   res.redirect('/404')
}

});

/*Get Login Page. */
router.get('/login',async function (req, res) {
    try {
        headers=await userHelper.getHeader()
        if (req.session.user) {
            res.render('user/otp', {user: req.session.user,headers})
        } else {
            res.render('user/login',{headers});
        }
    } catch (error) {
        res.redirect('/404')
    }


});

/*post login Page.*/
router.post('/login', async function (req, res) {

    try{
    headers=await userHelper.getHeader()

    userHelper.doLogin(req.body).then((response) => {
        if (response.status) {

            req.session.user = response.user
            req.session.loggedIn = true
            // res.render('user/index',{user:req.session.user})
            res.redirect('/')

        } else {
            req.session.loggedErr = true
            req.session.loggedIn = false
            res.render('user/login', {err_msg: 'Enter the correct credential',headers})
        }
    })
}catch{
    res.redirect('/404')
}
});
/*Get Signup Page.*/
router.get('/signup',async function (req, res) {
    try{
    headers=await userHelper.getHeader()
    if(req.query){
         referal_name=req.query.ref_name
    }
    else{
        referal_name="" 
    }
    
    res.render('user/signup',{referal_name,headers,err_msg:''});
}catch{
    res.redirect('/404')
}
});

/*Post Signup Page.*/
router.post('/signup', async (req, res) => {

   
        headers=await userHelper.getHeader()
        if (req.body.email != undefined && req.body.phone != undefined && req.body.fname != undefined && req.body.lname != undefined && req.body.phone != undefined && req.body.password != undefined) {
            let email = await userHelper.emailcheck(req.body)
            let phone = await userHelper.phonecheck(req.body)
            
            if (email.status && phone.status) {
    
                res.render('user/signup', {err_msg: 'User is already exist',headers})
            } else if (! email.status && ! phone.status) {
    
                client.verify.services(serviceid).verifications.create({
                        to: `+91${
                        req.body.phone
                    }`,
                    channel: 'sms'
                }).then(verification => res.render('user/otp', {name_body: req.body,headers}));
    
            } else { // console.log('error')
                res.render('user/signup', {err_msg: 'User  Already exist',headers})
    
            }
    
    
        } else {
            //console.log('error')
            res.render('user/signup', {err_msg: 'Enter Every field Properly',headers})
    
        }
   


});


/*Post Signup Page.*/
router.post('/otp', async (req, res) => {
    
    client.verify.services(serviceid).verificationChecks.create({
            to: `+91${
            req.body.phone
        }`,
        code: req.body.OTP
    }).then((verification_check) => {
        userHelper.doSignup(req.body).then(async (response) => {
            if (response) {
                req.session.user = response;

                req.session.loggedIn = true;
                res.redirect('/')
            } else {
                req.session.loggedIn = false;
                res.redirect('/signup')
            }
        })
    }).catch(async(error) => {
        headers=await userHelper.getHeader()
        res.render('user/signup', {err_msg: "Invalid Otp ..!",headers})
    });

})

/****** logout page*******/

router.get('/logout', verifyLogin, (req, res, next) => {
    req.session.destroy()
    res.redirect('/')
})


router.get('/product-details/:id', verifyLogin, cartcnt, async (req, res, next) => {
    headers=await userHelper.getHeader()
    cartCount = req.session.cartCount
    let product = await productHelpers.getProductDetails(req.params.id)

    res.render('user/product-details', {
        product,
        user: req.session.user,
        cartCount,
        headers
    });

})


router.get('/add-to-cart/:id', cartcnt, verifyLogin, async(req, res) => {
    headers=await userHelper.getHeader()
    userHelper.addToCart(req.params.id, req.session.user._id).then(async (response) => { // res.redirect('/cart')
        cartCount = await userHelper.getCartCount(req.session.user._id)
        cartCount = req.session.cartCount
        res.json({status: true, cartCount,headers})
    })

})


router.get('/cart', verifyLogin, cartcnt, async (req, res) => {
    cartCount = req.session.cartCount
    let user = req.session.user
    headers=await userHelper.getHeader()
    
    let products = await userHelper.getCartProducts(req.session.user._id)

    // couponccode=products[0].couponccode.toString()
    // console.log(products[0].couponccode)
    let coupon = await userHelper.getCartcoupondata(req.session.user._id)

    let totalamount = 0
    let checks = false

    // console.log(products)
    if (! products[0]) {
        totalamount = 0
        totalamtwithotcoupon=0
        checks = true
    } else {
        totalamount = await userHelper.getTotalAmount(req.session.user._id)
        totalamtwithotcoupon = await userHelper.getTotalAmountWithoutCoupon(req.session.user._id)
        checks = false
    }
    

    let address = await userHelper.getAddress(req.session.user._id)
    
    res.render('user/cart', {
        products,
        users: req.session.user._id,
        checks,
        cartCount,
        user,
        totalamtwithotcoupon,
        totalamount,
        address,
        headers

    })

})


/*******************address form ********** */
router.get('/add-address', cartcnt, verifyLogin, async (req, res) => {
    let totalamount = await userHelper.getTotalAmount(req.session.user._id)
    headers=await userHelper.getHeader()
    res.render('user/add-address', {totalamount, cartCount, user: req.session.user,headers});


})




/*******************adress form end ********** */

/*******************address form post ********** */
router.post('/add-address', cartcnt, verifyLogin, (req, res) => {

    userHelper.addadress(req.body).then(async (response) => {
        cartCount = req.session.cartCount
        let user = req.session.user
        let form1 = 'open'
        let products = await userHelper.getCartProducts(req.session.user._id)
        let totalamount = await userHelper.getTotalAmount(req.session.user._id)

        let address = await userHelper.getAddress(req.session.user._id)
        headers=await userHelper.getHeader()
        res.render('user/cart', {
            products,
            users: req.session.user._id,
            cartCount,
            user,
            totalamount,
            address,
            form1,
            headers
        })
    })


})

router.get('/Edit-Address/:addreessId', cartcnt, verifyLogin, async(req, res) => {
    cartCount = req.session.cartCount
    let user = req.session.user
    let address = await userHelper.getAddressbyid(req.params.addreessId)
    headers=await userHelper.getHeader()
    res.render('user/edit-address',{
        cartCount,
        user,
        address,
        headers
    })

})

router.get('/delete-Address/:id', verifyLogin, async (req, res) => {

    userHelper.deleteAddress(req.params.id).then((response) => {

        res.redirect('/address');

    })

})



router.post('/Edit-Address/:addreessId', cartcnt, verifyLogin, (req, res) => {

    userHelper.updateAddress(req.params.addreessId,req.body).then((response)=>{ 
        
        res.redirect('/address')
    })

})


/*** add address Userpage */
router.post('/add-addressuser', cartcnt, verifyLogin, (req, res) => {

    userHelper.addadress(req.body).then(async (response) => {
        cartCount = req.session.cartCount
        

        let address = await userHelper.getAddress(req.session.user._id)
        res.redirect('/address')
    })


})

/*  add address Userpage end  */

/*******************adress form end ********** */

/*******************Change product quantity********** */
router.post('/change-product-quantity', verifyLogin, cartcnt, async (req, res, next) => { // console.log("hhh")
    let productcount = await userHelper.productcount(req.body.cart)
    // console.log(productcount)
    userHelper.changeProductQuantity(req.body, productcount).then(async (response) => {
        response.totalamount = await userHelper.getTotalAmount(req.body.user)
        res.json(response)

    })
})


/*******************Remove product ********** */
router.post('/remove-product', verifyLogin, cartcnt, (req, res, next) => {

    userHelper.removeProduct(req.body).then((response) => {
        return new Promise((resolve, reject) => {
            res.json(response)
        })
    })
})

/*******************remove product  End ********** */

/*******************place order ********** */
router.post('/place-orders', verifyLogin, cartcnt, async (req, res) => {
    //console.log(req.body.selectAddress)
    // const addressid=req.body.addressid
    let cartItem=await userHelpers.cartItem(req.session.user._id)
    let user = await userHelper.getUsertDetails(req.session.user._id)
    cartCount = req.session.cartCount
    let total_amount = await userHelper.getTotalAmount(req.session.user._id)
    headers=await userHelper.getHeader();
    if(cartItem[0].Wallet=='checked'){
        
       if(total_amount<=cartItem[0].walletamt){
        totalamount=1
       }
       else{
        totalamount=total_amount-cartItem[0].walletamt
       }

    }
    else{
        totalamount=total_amount
    }
   
   
    let address = await userHelper.getAddressbyid(req.body.selectAddress)

    address._id = address._id.toString()
    res.render('user/checkout', {
        totalamount,
        cartCount,
         user,
        address,
        cartItem,
        headers
    })


})

/*******************place order end ********** */


router.post('/place-order', verifyLogin, async (req, res) => {

    let cartItem=await userHelpers.cartItem(req.body.userId)
    let products = await userHelper.getCartProductList(req.body.userId)
    let total_Price = await userHelper.getTotalAmount(req.body.userId)
    
    let user = await userHelper.getUsertDetails(req.body.userId)
    
    if(cartItem[0].Wallet=='checked'){
        
       if(total_Price<=cartItem[0].walletamt){
        totalPrice=1
        wall=cartItem[0].walletamt-total_Price+1
        //console.log(cartItem[0].walletamt-walletupdate)
        walletupdate=cartItem[0].walletamt-wall
       }
       else{
        totalPrice=total_Price-cartItem[0].walletamt
        
        walletupdate=user.Wallet
        wall=0
       }

    }

    else{
        totalPrice=total_Price
        walletupdate=0;
        wall=user.Wallet
    }
//console.log(wall)
 
     
    orderrec = await userHelper.razorrecipt()
    
    if (orderrec != undefined) {
        
        orderId = orderrec
        req.body.receipt = parseInt(orderId) + parseInt(1)
        // console.log(orderId +"ss")
    } else { 
        orderId = 1
        req.body.receipt = parseInt(orderId)
    }
    
    if (req.body.paymentMethod == 'COD') { // console.log(req.body)//return new Promise((resolve, reject) => {
        userHelper.placeOrder(req.body, products, totalPrice,walletupdate,wall).then((response) => {
            res.json({codsuccess: true})
        })

    } else if (req.body.paymentMethod == 'razorpay') {

        userHelper.generateRazorpay(orderId, totalPrice,walletupdate,wall).then((response) => {
            response.data = req.body
            // console.log(response.data)
            res.json(response)


        })

    } else {
        userHelper.generatePaypal(products, totalPrice, req.body,walletupdate,wall).then((response) => {
            
         

            response.paypal = true

            // console.log('fine da')

            res.json(response)


        })
    }


})
router.get('/success/:id/:addressid', cartcnt, verifyLogin, async (req, res) => {
    // res.json(response)
    // console.log("hi paypal")
    let cartItem=await userHelpers.cartItem(req.params.id)

    let products = await userHelper.getCartProductList(req.params.id)
    //let totalPrice = await userHelper.getTotalAmount(req.params.id)
    let address = await userHelper.getAddressbyid(req.params.addressid)
    let total_Price = await userHelper.getTotalAmount(req.params.id)
    
    let user = await userHelper.getUsertDetails(req.params.id)
    //console.log(cartItem)
    if(cartItem[0].Wallet=='checked'){
        
       if(total_Price<=cartItem[0].walletamt){
        totalPrice=1
        wall=cartItem[0].walletamt-total_Price+1
        //console.log(cartItem[0].walletamt-walletupdate)
        walletupdate=cartItem[0].walletamt-wall
       }
       else{
        totalPrice=total_Price-cartItem[0].walletamt
        
        walletupdate=user.Wallet
        wall=0
       }

    }
    else{
        totalPrice=total_Price
        walletupdate=0;
        wall=user.Wallet
    }






    let orderdata = req.query
    // console.log(orderdata)
    let order = {
        ... address,
        orderdata
    }
    // console.log(order)
    userHelper.placeOrderpaypal(order, products, totalPrice,walletupdate,wall).then((response) => { // res.json({codsuccess: true})
        res.redirect('/order-success')
    })
    // console.log(req.params.id)
    // console.log(req.query)


})


router.get('/order-success', cartcnt, verifyLogin, async(req, res) => {
    cartCount = req.session.cartCount
    headers=await userHelper.getHeader()
    res.render('user/order-success', {
        user: req.session.user,
        cartCount,
        status: 'ok',
        headers

    })
})

router.get('/orders', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let orders = await userHelper.getOrderList(req.session.user._id)
    headers=await userHelper.getHeader()
   
    res.render('user/order-success', {
        user: req.session.user,
        cartCount,
        orders,
        headers,
        status: 'false'
    })
})

router.get('/orderdetail/:id', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let orders = await userHelper.getOrderDetail(req.params.id,req.session.user._id)
    headers=await userHelper.getHeader()
    res.render('user/order-detail', {
        user: req.session.user,
        cartCount,
        orders,
        status: 'false',
        headers
    })
})

router.post('/orderpdf', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
 await userHelper.getOrderDetail(req.body.userid,req.session.user._id).then((response)=>{
    
    res.json(response)
    })
     
   
})


router.get('/userpage', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let address = await userHelper.getAddress(req.session.user._id)
    let user = await userHelper.getUsertDetails(req.session.user._id)
    headers=await userHelper.getHeader()
    res.render('user/userpage', {user, cartCount, address,headers})
})
router.get('/Editprofie/:id', cartcnt, verifyLogin, async (req, res) => {

    cartCount = req.session.cartCount
    // let userDetail=await userHelper.getUsertDetails(req.params.id)
    headers=await userHelper.getHeader()
    let user = await userHelper.getUsertDetails(req.session.user._id)
    res.render('user/edit-profile', {user, cartCount,headers});

})

router.post('/edit-profile/:pid', cartcnt, verifyLogin, (req, res) => {
    cartCount = req.session.cartCount


    userHelper.updateProfile(req.params.pid, req.body).then(async (response) => {

        // cartCount=req.session.cartCount
        // let address=await userHelper.getAddress(req.session.user._id)
        // let user=await userHelper.getUsertDetails(req.session.user._id)
        // res.render('user/userpage',{user,cartCount,address})

        res.redirect('/userpage')

    })
})


router.get('/cancel-order/:pid', cartcnt, verifyLogin, (req, res) => {

    userHelper.updateOrderStaus(req.params.pid).then(() => {
        res.redirect('/order-success')


    })
})


router.get('/changepassword', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let user = await userHelper.getUsertDetails(req.session.user._id)
    headers=await userHelper.getHeader()
    res.render('user/change-password', {
        user: user,
        cartCount,
        headers
    })

})

router.get('/address', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount
    let address = await userHelper.getAddress(req.session.user._id)
    headers=await userHelper.getHeader()
    res.render('user/address', {
        user: req.session.user,
        cartCount,
        address,
        headers
    })

})

router.post('/changepassword', cartcnt, verifyLogin, async (req, res) => {
    cartCount = req.session.cartCount;
    headers=await userHelper.getHeader()
    userHelper.chekChangePassword(req.session.user, req.body).then((response) => {
        if (response.status) {
            client.verify.services(serviceid).verifications.create({
                    to: `+91${
                    req.session.user.phone
                }`,
                channel: 'sms'
            }).then(verification => res.render('user/otp-changepass', {name_body: req.body,headers}));
        } else {
            res.render('user/change-password', {err_msg: "Enter The Correct Data",headers})
        }

    }).catch((error) => {
        res.render('user/change-password', {err_msg: "Please Retry after sometimes",headers})
    })


})


router.post('/changepass', cartcnt, verifyLogin, (req, res) => {

    client.verify.services(serviceid).verificationChecks.create({
            to: `+91${
            req.session.user.phone
        }`,
        code: req.body.OTP
    }).then((verification_check) => {
        userHelper.changepass(req.body, req.session.user._id).then(async (response) => {
            // cartCount=req.session.cartCount
            // let address=await userHelper.getAddress(req.session.user._id)

            // res.render('user/userpage',{user:req.session.user,cartCount,address})
            res.redirect('/userpage')
        })
    })
})

router.post('/verify-payment', verifyLogin, cartcnt, async (req, res) => {
    // console.log(req.body)
     //console.log(req.body.order.data.userId)
     let cartItem=await userHelpers.cartItem(req.body.order.data.userId)
    let products = await userHelper.getCartProductList(req.body.order.data.userId)
    let total_Price = await userHelper.getTotalAmount(req.body.order.data.userId)
    let user = await userHelper.getUsertDetails(req.body.order.data.userId)
    
    if(cartItem[0].Wallet=='checked'){
        
       if(total_Price<=cartItem[0].walletamt){
        totalPrice=1
        wall=cartItem[0].walletamt-total_Price+1
        //console.log(cartItem[0].walletamt-walletupdate)
        walletupdate=cartItem[0].walletamt-wall
       }
       else{
        totalPrice=total_Price-cartItem[0].walletamt
        
        walletupdate=user.Wallet
        wall=0
       }

    }
    else{
        totalPrice=total_Price
        walletupdate=0;
        wall=user.Wallet
    }
    //console.log(user.Wallet)
    orderrec = await userHelper.razorrecipt()
   // console.log(orderrec)
    if (orderrec != undefined) {
        
        orderId = parseInt(orderrec) + parseInt(1)
       // req.body.receipt = parseInt(orderId) + parseInt(1)
        // console.log(orderId +"ss")
    } else { 
        orderId = 1
        //req.body.receipt = parseInt(orderId)
    }

    //console.log(wall)
    userHelper.verifyPayment(req.body).then(() => {
        
        
        let data = req.body
        req.body.receipt=orderId
        // console.log(req.body['order[data]'])
        userHelper.placeOrderrazor(data, products, totalPrice,walletupdate,wall).then((response) => { // res.json({codsuccess: true})

             //response.insertedId
            
            //userHelpers.changePaymentStatus(order_Id).then(() => {
               
                res.json({status: true})

           // })

        })
    }).catch((err) => {
        console.log('eee' + err)
        res.json({status: false, err_msg: 'Some Error'})
    })
})

router.get('/crop-images/:id',verifyLogin, cartcnt,async (req, res) => {
    cartCount = req.session.cartCount
    user = req.params.id
    headers=await userHelper.getHeader()
    res.render('user/crop-images', {
        crop: true,
        user,
        cartCount,
        headers
    })
})

router.post('/crop-images', (req, res) => { // console.log("ggg")
    let user = req.body.user
    let image = req.body.image
    // console.log(req.body)
    userHelpers.profilePicChange(user, image).then(() => {
        res.redirect('/userpage')
    })
})


router.post('/applycoupon',cartcnt, verifyLogin, async (req, res) => { // console.log(req.body)
    let coupon = await userHelper.getCartcoupon(req.body.enteredcoupon)
    let coupondata=await userHelper.getCartcoupondata_use(req.body.userid)
 //console.log(req.body.userid)
    if (coupon != undefined && coupondata==0 ) {

        userHelpers.checkUsedCoupon(req.body).then((response) => {
            if (response.status) {

                userHelpers.applyCoupon(req.body).then((response) => { // console.log(response);
                    res.json(response)
                })

            } else {
                res.json(response)

            }


        })
    

    }else if(coupondata.length>0){
        res.json({usedStatus:true})
    }
    
    
    else {
        res.json({status: false})
    }


})


router.post('/removeCoupon',cartcnt, verifyLogin, (req, res) => { // console.log((req.body));
    userHelpers.removeCoupon(req.body.userid, req.body.coupid).then(async (response) => {
        
        userHelpers.removecoupnid(req.body.userid, req.body.coupid).then(async (response) => {
            res.json({status: true})
        })

    })
})


router.get('/referalcode',cartcnt, verifyLogin,async (req, res) => {
    cartCount = req.session.cartCount
    let referalamount=await productHelpers.refamount()
    headers=await userHelper.getHeader()
    let user = await userHelper.getUsertDetails(req.session.user._id)
       res.render('user/referalcode', {
        user: user,
        cartCount,
        referalamount:referalamount,
        headers
    })
})


router.post('/getcoupon',cartcnt, verifyLogin,async (req, res) => {
   // cartCount = req.session.cartCount
   
   let coupon = await userHelper.getCartcoupondata(req.body.userid)
//console.log(coupon)
   if (coupon){
    res.json(coupon)
   }
  else{
    res.json({status:true})
  }
   
})

router.post('/wallet',cartcnt, verifyLogin,async (req, res) => {
   
    userHelpers.walletApply(req.body).then((response) => { // console.log(response);
        res.json(response)
    })
 
    
 })


 router.post('/walletremove',cartcnt, verifyLogin, (req, res) => {
   
    userHelpers.walletremove(req.body).then((response) => { // console.log(response);
        res.json(response)
    })
 
    
 })

 router.get('/shop',cartcnt, verifyLogin,async (req, res) => {
    cartCount = req.session.cartCount
    
    headers=await userHelper.getHeader()
    let user = await userHelper.getUsertDetails(req.session.user._id)
    
    productHelpers.viewproduct().then(product => {
        
        let a = product
        
        res.render('user/shop', {a, cartCount, user,headers});

   
})
     
})


router.get('/categorysort/:id',cartcnt, verifyLogin,async (req, res) => {
    cartCount = req.session.cartCount
   
    headers=await userHelper.getHeader()

    sortHelper.viewCategoryId(req.params.id).then(product => {
        
            let a = product
            
            res.render('user/shop', {a, cartCount, user: req.session.user,headers});

       
    })    
})

router.get('/shopsort/:price',cartcnt, verifyLogin,async (req, res) => {
        cartCount = req.session.cartCount
       
        headers=await userHelper.getHeader()
    if(req.params.price==-1){
        productHelpers.viewproduct().then(product => {
        
            let a = product
            
            res.render('user/shop', {a, cartCount, user: req.session.user,headers,checkamount:req.params.price});
    
       
    })

    }
    else{
        sortHelper.priceSort(req.params.price).then(product => {
            
            let a = product
            
            res.render('user/shop', {a, cartCount, user: req.session.user,headers,checkamount:req.params.price});

       
    })
    }
         
     
})


module.exports = router;
