var db = require('../config/config');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
const Razorpay = require('razorpay')
var objectId = require('mongodb').ObjectId
// const dotenv=require('dotenv');
// dotenv.config({path:'./config/config.env'})

var instance = new Razorpay({key_id: process.env.RAZOR_ID, key_secret: process.env.RAZOR_SECRET_ID});

const paypal = require('paypal-rest-sdk');


paypal.configure({
    'mode': 'sandbox', // sandbox or live
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
});


module.exports = {
    emailcheck: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email: data.email});
            if (user) {
                resolve({status: true})
            } else {
                resolve({status: false})

            }
        })

    },
    phonecheck: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({phone: data.phone});
            if (user) {
                resolve({status: true})
            } else {
                resolve({status: false})

            }
        })

    },

    // userDetail:(userid)=>{
    //     return new Promise(async (resolve, reject) => {

    //         let user = await db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(userid)})
    //     //    console.log(user)
    //         resolve(user);
    //     })

    //     //let user = await db.get().collection(collection.USER_COLLECTION).findOne({email: userData.email});
    // },
    doSignup: (userData) => {

        return new Promise(async (resolve, reject) => {
            userData.password = await bcrypt.hash(userData.password, 10);
            let key = "OTP"
            delete userData[key];
            const imUser = {
                ...userData,
                status: true
            }

            return new Promise(async (reso, rej) => {

                let respon = {}
                //let userin = await db.get().collection(collection.USER_COLLECTION).findOne({email: userData.email});

                db.get().collection(collection.USER_COLLECTION).insertOne(imUser).then(async(data) => {

                    if(userData.referal){
                        let userref=await db.get().collection(collection.USER_COLLECTION).find({_id:objectId(userData.referal)},{Wallet:1}).toArray();
                        let walletamount=await db.get().collection(collection.REFERRAL_COLLETION).find({},{walletamount:1}).toArray();
                        //console.log(user[0].Wallet);
                        if(userref[0].Wallet){
                            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userData.referal)},
                            
                                {$inc:{Wallet:walletamount[0].walletamount}}
                            )
                        }else{
                            await db.get().collection(collection.USER_COLLECTION).updateOne({_id:objectId(userData.referal)},
                            [{
                                $addFields:{"Wallet":{$toInt:walletamount[0].walletamount}}
                            }])
                        }
                    }





                    
                    let user = await db.get().collection(collection.USER_COLLECTION).findOne({email: userData.email});
                    // resolve(data.insertedId.toString());
                    resolve(user);

                }).catch((err) => {
                    console.log('error' + err);
                })


            })

        })
    },
    doLogin: (userData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({email: userData.email});

            if (user) {
                // console.log(userData.password)
                // console.log(user.password)

                let rep = await bcrypt.compare(userData.password, user.password)

                if (rep) {
                    response.user = user
                    // console.log(response.user)
                    // console.log(response.user)
                    response.status = true
                    resolve(response)
                } else {
                    resolve({status: false})
                }

            } else {
                resolve({status: false})

            }
        })
    },


    addToCart: (prodId, userId) => {
        let proObj = {
            item: objectId(prodId),
            quantity: 1
        }

        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userId)})
            if (userCart) {
                let proExist = userCart.products.findIndex(product => product.item == prodId)
                //console.log(proExist);

                if (proExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({
                        user: objectId(userId),
                        'products.item': objectId(prodId)
                    }, {
                        $inc: {
                            'products.$.quantity': 1
                        }
                    }).then((response) => {
                        resolve({cnt:0})
                    })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({
                        user: objectId(userId)
                    }, {

                        $push: {
                            products: proObj
                        }

                    }).then((response) => {
                        resolve({cnt:1})
                    })
                }

            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {

            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userId)})
            if (cart) {
                count = cart.products.length
            }
            resolve(count);
        })
    },

    getCartProducts: (userId) => {


        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([

                {
                    $match: {
                        user: objectId(userId)
                    }
                },
                {
                    $unwind: '$products'

                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity',
                        couponstatus:1,
                        couponName:1,
                        coupon:1,
                        couponccode:1
                    }

                },
                
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIOS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },  
                {
                    $project: {
                        item: 1,
                        quantity: 1,
                        images: 1,  
                        oferamt:1,
                        offerper:1,
                        catofferper:1,
                        catoffstatus:1,
                        status:1,
                        subCategory: 1,
                        couponstatus:1,
                        couponName:1,
                        coupon:1,
                        couponccode:1,
                        //total:'$product.offerper', 
                                                                  
                        product: {

                            $arrayElemAt: ['$product', 0]
                        }
                        
                    }


                },{
                    $unwind:'$product'
                },
                {
                    $project:{
                        item: 1,
                        quantity: 1,
                        product:1,
                        couponstatus:1,
                        couponName:1,
                        coupon:1,
                        couponccode:1,
                        off:{

                            $cond: {
                                if : {$or:[{$eq:['$product.catoffstatus',true]},{$eq:['$product.status',true]},{$eq:['$couponstatus',true]}]} ,
                                then: {$floor:{$multiply: [{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.catofferper',0]}]}]},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.offerper',0]}]}]},'$product.price']},100]}]}]},{$ifNull:['$coupon',1]}]}},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                                else:'$product.price'  
    
                                
    
                          } 
                        },
                        total:{
                              
                       
                  
                            $cond: {
                                // if : {$eq:['$product.catoffstatus',true]},
                                // then:{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,'$product.catofferper']},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,'$product.offerper']},'$product.price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                                // else:'$product.price' 
                                if : {$or:[{$eq:['$product.catoffstatus',true]},{$eq:['$product.status',true]}]} ,
                                then:{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.catofferper',0]}]}]},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.offerper',0]}]}]},'$product.price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                                else:'$product.price'  
    
                                
    
                          } 
                        }
                    }
                }



            ]).toArray()
            // console.log('sssabari')
             //console.log(cartItems)
            resolve(cartItems)

        }).catch((err) => {
            console.log('error' + err)
        })
    },
    getTotalAmount: (userId) => {
        return new Promise(async (resolve, reject) => {
     try{ total = await db.get().collection(collection.CART_COLLECTION).aggregate([

        {
            $match: {
                user: objectId(userId)
            }
        },
        {
            $unwind: '$products'

        },
        {
            $project: {
                item: '$products.item',
                quantity: '$products.quantity',
                couponstatus:1,
                couponName:1,
                coupon:1,
            }

        },
        {
            $lookup: {
                from: collection.PRODUCT_COLLECTIOS,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
            }
        }, {
            $project: {
                item: 1,
                quantity: 1,
                couponstatus:1,
                couponName:1,
                coupon:1,
                product: {
                    $arrayElemAt: ['$product', 0]
                }
            }

        }, {
            // $group: {
            //     _id: null,
            //     total: {
            //         $sum: {
            //             $cond:{
            //                 if : {$eq:['$product.status',true]},
            //                 then:{ $multiply: ['$quantity', '$product.oferamt']},
            //                 else:{ $multiply: ['$quantity', '$product.price']}
            //             }
                       
            //         }
            //     }

            // }



             $group: {
                _id: null,
                total: {
                    $sum: {
                        $cond:{
                            if : {$or:[{$eq:['$product.catoffstatus',true]},{$eq:['$product.status',true]},{$eq:['$couponstatus',true]}]},
                            then:{$floor:{ $multiply:[{$ifNull:['$coupon',1]},{ $multiply: ['$quantity',{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.catofferper',0]}]}]},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.offerper',0]}]}]},'$product.price']},100]}]}]}]}]}},
                            //{ $multiply: ['$quantity', {$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,'$product.catofferper']},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$status','$offper',0]}]}]},'$product.price']},100]}]}]}]},
                            else:{ $multiply: ['$quantity', '$product.price']}
                        }
                       // {$subtract:[{$subtract:['$price',{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]}]}]},{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$status','$offper',0]}]}]},'$price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                    }

                    

                }

            }
            
        },

        


    ]).toArray()
   //console.log(total[0].total)
    resolve(total[0].total);
}
 catch(e)  {
    total=0
 }       
           
               //console.log(total[0].total)
            resolve(total[0]);
        })
    },
    getAddress: (userId) => {
        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_ADDRESS_COLLECTION).find({userId: userId}).toArray();

            resolve(address)

        })
    },
    addadress: (data) => {
        return new Promise(async (resolve, reject) => {
            if (data.check == 'checked') {

                db.get().collection(collection.USER_ADDRESS_COLLECTION).updateMany({
                    userId: data.userId
                }, {
                    $set: {
                        check: 'uncheked'

                    }
                }).then((response) => {
                    db.get().collection(collection.USER_ADDRESS_COLLECTION).insertOne(data).then((response) => {
                        resolve(response)

                    })
                })

            } else {
                db.get().collection(collection.USER_ADDRESS_COLLECTION).insertOne(data).then((response) => {
                    resolve(response)

                })
            }


        })
    },
    productcount:(cartid)=>{

    return new Promise(async (resolve, reject) => {
      let count=  await db.get().collection(collection.CART_COLLECTION).aggregate([
            {
                $match:{_id:objectId(cartid)}
            },
            {$project: {_id:0, count: { $size:"$products" }}}
        ]).toArray()
        resolve(count[0].count)
    })
    
    },
    changeProductQuantity: (details,productscount) => {

        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        
        return new Promise((resolve, reject) => {

           

            if (details.count == -1 && details.quantity == 1) {
               if(productscount!=1){
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    _id: objectId(details.cart)

                }, {
                    $pull: {
                        products: {
                            item: objectId(details.product)
                        }
                    }
                }).then((response) => {

                    resolve({removeProduct: true})
                })
                 

               }
               else{
                db.get().collection(collection.CART_COLLECTION).remove({
                    _id: objectId(details.cart)

                }).then((response) => {

                    resolve({removeProduct: true})
                })
               }
                


            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({
                    _id: objectId(details.cart),
                    'products.item': objectId(details.product)
                }, {
                    $inc: {
                        'products.$.quantity': details.count
                    }
                }).then((response) => {
                    resolve({status: true})
                })
            }


        })
    },
    removeProduct: (details) => {

        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)

        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION).updateOne({
                _id: objectId(details.cart)

            }, {
                $pull: {
                    products: {
                        item: objectId(details.product)
                    }
                }
            }).then((response) => {
                resolve({removeProduct: true})
            })

        })

    },
    getAddressbyid: (id) => {

        return new Promise(async (resolve, reject) => {
            let address = await db.get().collection(collection.USER_ADDRESS_COLLECTION).findOne({_id: objectId(id)})

            resolve(address)

        })

    },
    getCartProductList: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({user: objectId(userId)})
            // console.log(cart.products)
            resolve(cart.products)

        })
    },
    placeOrder: (order, products, total,walletupdate,wall) => {
        
        

       // console.log(walletupdate)
        //if(walletupdate){}
        return new Promise(async (resolve, reject) => {
            let orderObj = {
                deliveryDetails: {
                    phone: order.phone,
                    address: order.address,
                    zip: order.zip
                },
                userId: objectId(order.userId),
                paymentMethod: order.paymentMethod,
                products: products,
                totalAmount: total,
                Walletpay:walletupdate,
                receipt:order.receipt,
                status: {
                    placed: true,
                    cancel: false,
                    dispatch: false,
                    shipped: false,
                    delivered: false
                },
                dat: new Date()

            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
               
                db.get().collection(collection.USER_COLLECTION).updateOne({
                    _id: objectId(order.userId)
    
                }, {
                    $set: {
                        
                        Wallet: wall
                        
                    }
                }).then((resp) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({
                        user: objectId(order.userId)
                    })
                })



                


                resolve(response)
            })

        })
    }, 
        
    placeOrderrazor: (order, products, total,walletupdate,wall) => {
       
        return new Promise(async (resolve, reject) => {
            let orderObj = {
                deliveryDetails: {
                    phone: order.body.phone,
                    address: order.body.address,
                    zip: order.body.zip
                },
                userId: objectId(order.body.userId),
                paymentMethod: order.body.paymentMethod,
                products: products,
                totalAmount: total,
                Walletpay:walletupdate,
                receipt:parseInt(order.body.receipt),
                status: {
                    placed: true,
                    cancel: false,
                    dispatch: false,
                    shipped: false,
                    delivered: false
                },
                dat: new Date()

            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.USER_COLLECTION).updateOne({
                    _id: objectId(order.body.userId)
    
                }, {
                    $set: {
                        
                        Wallet: wall
                        
                    }
                }).then((resp) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({
                        user: objectId(order.body.userId)
                    })
                })


               
                resolve(response)
            })

        })
    },

    placeOrderpaypal: (order, products, total,walletupdate,wall) => {
       
       //console.log(order)
        return new Promise(async (resolve, reject) => {
            let orderObj = {
                deliveryDetails: {
                    phone: order.orderdata.phone,
                    address: order.address,
                    zip: order.zip
                },
                userId: objectId(order.userId),
                paymentMethod: order.orderdata.paymentMethod,
                products: products,
                totalAmount: total,
                Walletpay:walletupdate,
                receipt:parseInt(order.orderdata.receipt),
                status: {
                    placed: true,
                    cancel: false,
                    dispatch: false,
                    shipped: false,
                    delivered: false
                },
                dat: new Date()

            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
               
                db.get().collection(collection.USER_COLLECTION).updateOne({
                    _id: objectId(order.userId)
    
                }, {
                    $set: {
                        
                        Wallet: wall
                        
                    }
                }).then((resp) => {
                    db.get().collection(collection.CART_COLLECTION).deleteOne({
                        user: objectId(order.userId)
                    })
                })




               
                resolve(response)
            })

        })
    },
    getOrderList: (userId) => {
        return new Promise(async (resolve, reject) => {
            // let orders = await db.get().collection(collection.ORDER_COLLECTION).find({userId: objectId(userId)}).sort({_id:-1}).toArray()
            let orders = await db.get().collection(collection.ORDER_COLLECTION).
            aggregate([
                {$match:{userId: objectId(userId)}},
                {
                    "$project": {
                        "dats":"$dat"
                          ,
                        "dat": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$dat"
                            }
                        },
                        "_id": 1,
                        "deliveryDetails": 1,
                        "userId": 1,
                        "paymentMethod": 1,
                        "products": 1,
                        "totalAmount": 1,
                        "status": 1

                    }
                }
            ]).sort({dats:-1}).toArray()
            resolve(orders)

        })
    },
    
    getOrderDetail: (orderId,userId) => {
        return new Promise(async (resolve, reject) => {
            let orderItem = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
                },
                {
                    $match:{userId:objectId(userId)}
                },
                {$unwind:'$products'},
                {$unwind:'$status'},
                
                {
                  $project:{
                    item:'$products.item',
                    quantity:'$products.quantity',
                    Walletpay:1,
                    totalAmount:1,
                    receipt:1,
                    dat:1,
                    status:1
                  }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIOS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {$project:{

                                        
                  
                    quantity:1,
                    product:{$arrayElemAt: ['$product', 0]},
                    receipt:1,
                    totalAmount:1,
                    Walletpay:1,
                    dat:1,
                    status:1
                } 
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item: 1,
                        quantity: 1,
                        product:1,
                        totalAmount:1,
                        receipt:1,
                        Walletpay:1, 
                        "dat": {
                            "$dateToString": {
                                "format": "%Y-%m-%d",
                                "date": "$dat"
                            }
                        },
                        status:1,

                        total:{
                              
                       
                  
                            $cond: {
                                // if : {$eq:['$product.catoffstatus',true]},
                                // then:{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,'$product.catofferper']},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,'$product.offerper']},'$product.price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                                // else:'$product.price' 
                                if : {$or:[{$eq:['$product.catoffstatus',true]},{$eq:['$product.status',true]}]} ,
                                then:{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.catofferper',0]}]}]},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.offerper',0]}]}]},'$product.price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                                else:'$product.price'  
    
                                
    
                          } 
                        }
                    }
                }


            ]).toArray();
            
            resolve(orderItem)
        })


    },



    updateProfile: (prodid, userDetails) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: objectId(prodid)
            }, {
                $set: {
                    fname: userDetails.fname,
                    lname: userDetails.lname,
                    phone: userDetails.phone

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getUsertDetails: (proid) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).findOne({_id: objectId(proid)}).then((response) => {
                resolve(response)
            })
        })
    },

    

    updateOrderStaus: (proid) => {


        return new Promise((resolve, reject) => {

            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: objectId(proid)
            }, {
                $set: {
                    status: {
                        placed: false,
                        cancel: true,
                        dispatch: false,
                        shipped: false,
                        delivered: false
                    }
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },


    chekChangePassword: (userData, changeuser) => {

        return new Promise(async (resolve, reject) => {
            let response = {}
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({
                _id: objectId(userData._id)
            });


            if (user) {
                return new Promise(async (reso, rej) => {
                    let checkcurentpassword = await bcrypt.compare(changeuser.password, user.password)
                    let newpassword = await bcrypt.compare(changeuser.npass, user.password)
        
                    if (checkcurentpassword != newpassword && checkcurentpassword!=false) {
                        response.user = user
                        response.status = true
                        resolve(response)
                    }
                    // else if(checkcurentpassword){
                    //     resolve({status: false})
                    // }
                    
                    else {
                        resolve({status: false})

                    }

                })
            } else {
                resolve({status: false})

            }
        })
    },

    changepass: (newpass, userId) => {
        return new Promise(async (resolve, reject) => {

            newpass.password = await bcrypt.hash(newpass.password, 10);

            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: objectId(userId)
            }, {
                $set: {
                    password: newpass.password

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    generateRazorpay: (orderId, totalPrice) => {
        //console.log(orderId)
        return new Promise((resolve, reject) => {
            //console.log(orderId)

            var options = {
                amount: totalPrice * 100,
                currency: "INR",
                receipt: parseInt(orderId) 
            }
            instance.orders.create(options, function (err, order) {

                //console.log("New Order :", order);
                resolve(order);
            })

        })
    },

    generatePaypal: (products, totalPrice,order) => {
        //console.log(order.receipt)
       //order.ad=order.address
        return new Promise((resolve, reject) => {
            const create_payment_json = {
                "intent": "sale",
                "payer": {
                    "payment_method": "paypal"
                },
                "redirect_urls": {
                    "return_url": `http://localhost:3000/success/${order.userId}/${order.addressid}?paymentMethod=${order.paymentMethod}&receipt=${order.receipt}&phone=${order.phone}`,
                    "cancel_url": "http://localhost:3000/cart"
                },
                "transactions": [
                    {
                        "item_list": {
                            "items": [
                                {
                                    "name": "Red sok Hat",
                                    "sku": "001",
                                    "price": totalPrice,
                                    "currency": "USD",
                                    "quantity": 1
                                }
                            ]
                        },
                        "amount": {
                            "currency": "USD",
                            "total": totalPrice
                        },
                        "description": "This is the payment description."
                    }
                ]
            };

            paypal.payment.create(create_payment_json, function (error, payment) {
                if (error) {
                    throw error;
                } else {
                    payment.body=order
                    payment.products=products
                    payment.totalPrice=totalPrice
                   // console.log(payment)
                   
                   resolve(payment)
                 
                   
                }
            });

        })

    },


    verifyPayment: (details) => {
        //console.log(details)
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hmac = crypto.createHmac('sha256', 'jh7UxH26ViUIDmlsgLWvc7Ee')
            hmac.update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id)
            hmac = hmac.digest('hex')
            if (hmac == details.payment.razorpay_signature) {
               // console.log(details)
                resolve()
            } else {
                reject()
            }
        })
    },
    changePaymentStatus: (orderId) => { 

        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: objectId(orderId)
            }, {
                $set: {
                    status: {
                        placed: true,
                        cancel: false,
                        dispatch: false,
                        shipped: false,
                        delivered: false
                    }
                }

            }).then(() => {
                resolve()
            })
        })
    }, 
    profilePicChange:((user,image) => {
        //console.log('user')
        return new Promise(async (resolve, reject) => {
           db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(user) },{
               $set:{photo:image}
           })
            resolve()

        })

    }),

    razorrecipt:()=>{
        return new Promise(async (resolve, reject) => {
        let recipt=await db.get().collection(collection.ORDER_COLLECTION).find({},{_id:0,receipt:1}).sort({_id:-1}).limit(1).toArray()
        //console.log(recipt[0])
        if (recipt[0]===undefined){
            resolve(0)
        }
        else{
            resolve(recipt[0].receipt)
        }
         
       
 
        })
    },

    getCartcoupon:(couponid)=>{
        //console.log(couponid)
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLETION).findOne(
            {_id:objectId(couponid)}
           
            );
            
            resolve(coupon)
        })
    },
    getCartcoupondata:(userid)=>{
        //console.log(userId)
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLETION).aggregate([
           
                     {$match:
                        {
                            "userObj.user":{$ne:objectId(userid)}
                          }
                    }
        ]).toArray();
        //console.log('coupon')
           //console.log(coupon)
            resolve(coupon)
        })
    },

    getCartcoupondata_use:(userid)=>{
        //console.log(userId)
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLETION).aggregate([
           
                     {$match:
                        {
                            "userObj.user":objectId(userid)
                          }
                    }
        ]).toArray();
        //console.log('coupon')
           //console.log(coupon)
            resolve(coupon)
        })
    },



    checkUsedCoupon: (data) => {
        
        return new Promise(async (resolve, reject) => {

            let used = await db.get().collection(collection.COUPON_COLLETION).aggregate([

                {$match:{_id:objectId(data.enteredcoupon)}},

                {
                    $project:{
                        'userObj':1
                    }
                },
                {
                    $unwind: '$userObj'
                },
                {
                   $match:{
                       'userObj.user':objectId(data.userid)
                   }
                },
                {
                   $match:{
                       'userObj.status':true
                   }
                }
                
            ]).toArray().then((response) => {
                 // console.log(response)
                
                if (response.length == 0){
                   // console.log('dd')
                    resolve({ status: true })
                }
                else {
                    //console.log('fd')
                    resolve({ usedStatus: true })
                }
            }).catch((e)=>{
                resolve({status:false})
            })

        })

    },

    applyCoupon: (data) => {
        return new Promise(async (resolve, reject) => {



  
            let coupon = await db.get().collection(collection.COUPON_COLLETION).findOne({ _id: objectId(data.enteredcoupon ) })

            if (coupon) {
                let date = new Date()
                date = date.toISOString().split('T')[0]
                
               
                //console.log(date);
                if (date < coupon.endoffer) {
                    let response = {}

                    let  userObj = {
                        
                            user:objectId(data.userid),
                            status:true,
                       
                    }


                    let offer = parseInt(coupon.percentage) / 100 // change into point value lessthan 1 .

                    let offerprice = 1 - offer //1 is the default value in cart at coupon.
                    //console.log(offerprice);
                    await db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(data.userid) }, {

                        $set: {
                            coupon: offerprice,
                            couponName: coupon.coupon,
                            couponstatus: true,
                            couponccode: coupon._id,
                        }

                    }).then(async () => {



                        await db.get().collection(collection.COUPON_COLLETION).updateOne({ _id: objectId(data.enteredcoupon )  }, {

                            $push: {
                                userObj
                            }
    
    
                        }).then(async () => {
    
    
    
                            response.status = true
                            resolve(response)
                        })



                        // response.status = true
                        // resolve(response)
                    })

                } else {
                    //console.log('no coupon  ss');
                    resolve({ status: false })
                }







            }
            else {
                //console.log('no coupon dd');
                resolve({ status: false })
            }


        })
    },



    getTotalAmountWithoutCoupon: (userId) => {
        return new Promise(async (resolve, reject) => {
     try{ total = await db.get().collection(collection.CART_COLLECTION).aggregate([

        {
            $match: {
                user: objectId(userId)
            }
        },
        {
            $unwind: '$products'

        },
        {
            $project: {
                item: '$products.item',
                quantity: '$products.quantity',
                couponstatus:1,
                couponName:1,
                coupon:1,
            }

        },
        {
            $lookup: {
                from: collection.PRODUCT_COLLECTIOS,
                localField: 'item',
                foreignField: '_id',
                as: 'product'
            }
        }, {
            $project: {
                item: 1,
                quantity: 1,
                product: {
                    $arrayElemAt: ['$product', 0]
                }
            }

        }, {
            // $group: {
            //     _id: null,
            //     total: {
            //         $sum: {
            //             $cond:{
            //                 if : {$eq:['$product.status',true]},
            //                 then:{ $multiply: ['$quantity', '$product.oferamt']},
            //                 else:{ $multiply: ['$quantity', '$product.price']}
            //             }
                       
            //         }
            //     }

            // }



             $group: {
                _id: null,
                total: {
                    $sum: {
                        $cond:{
                            if : {$or:[{$eq:['$product.catoffstatus',true]},{$eq:['$product.status',true]},{$eq:['$couponstatus',true]}]},
                            then:{ $multiply:[{$ifNull:['$coupon',1]},{ $multiply: ['$quantity',{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.catofferper',0]}]}]},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.offerper',0]}]}]},'$product.price']},100]}]}]}]}]},
                            //{ $multiply: ['$quantity', {$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,'$product.catofferper']},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$status','$offper',0]}]}]},'$product.price']},100]}]}]}]},
                            else:{ $multiply: ['$quantity', '$product.price']}
                        }
                       // {$subtract:[{$subtract:['$price',{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]}]}]},{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$status','$offper',0]}]}]},'$price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                    }

                    

                }

            }
            
        },

        


    ]).toArray()
    //console.log(total[0].total)
    resolve(total[0].total);
}
 catch(e)  {
    total=0
 }       
           
               //console.log(total[0].total)
            resolve(total[0]);
        })
    },


    removeCoupon: (id,coupid) => {

        //console.log(coupid)
        return new Promise(async (resolve, reject) => {
            let usercart = await db.get().collection(collection.CART_COLLECTION).
            updateMany({ user: objectId(id) },
                { $unset: { coupon: "",couponName:"",couponstatus:"",couponccode:"" }
                }
            ).then(async(response) => {             
                

                resolve({ status: true })
            })
          
        })
    },
    removecoupnid: (id,coupid) => {

        //console.log(coupid)
        
        return new Promise(async (resolve, reject) => {
               





               // db.coupon.updateOne({_id:ObjectId('629f0ad638bf2ba528166c21')},{$pull:{userObj:{user:ObjectId('6287da6f8220051c0a66d580')}}})


                db.get().collection(collection.COUPON_COLLETION).updateOne({
                    _id: objectId(coupid)

                }, {
                    $pull: {
                        userObj: {
                            user: objectId(id)
                        }
                    }
                }).then((response) => {

                    resolve({removeCoupon: true})
                })
               
              
            })
           

            

            // return new Promise(async (resolve, reject) => {
            //     let usercart = await db.get().collection(collection.CART_COLLECTION).
            //     updateOne( {_id: objectId(coupid) },                           
            //     { $unset: { 'userObj': "" }}
         
            //     ).then(async(response) => {             
                    
    
            //         resolve({ status: true })
            //     })
              
            // })
          
       
    },


    walletApply:(data)=>{
        //console.log(data.userid)
        return new Promise((resolve, reject) => {

            db.get().collection(collection.CART_COLLECTION).updateOne({
                user: objectId(data.userid)
            }, {
                $set: {

                wallet:true,
                walletamt:parseInt(data.wallet) 

                }
            }).then((response) => {
                resolve({status:true})
            })
        })
        

    },


    walletremove:(data)=>{
        //console.log(data.userid)
        return new Promise((resolve, reject) => {

            db.get().collection(collection.CART_COLLECTION).updateOne({
                user: objectId(data.userid)
            }, {
                $unset: { wallet: "",walletamt:"" }
            }).then((response) => {
                resolve({status:true})
            })
        })
        

    },

    


    cartItem:(userId)=>{
        //console.log(userId)
        return new Promise(async (resolve, reject) => {
            let cartItem = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:objectId(userId)}
                },
                {$unwind:'$products'},
                {
                  $project:{
                    item:'$products.item',
                    quantity:'$products.quantity',
                    wallet:1,
                    walletamt:1,
                  }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTIOS,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {$project:{

                    couponstatus:1,
                    couponName:1,
                    coupon:1,
                    couponccode:1,                      
                    wallet:1,
                    walletamt:1,
                    quantity:1,
                    product:{$arrayElemAt: ['$product', 0]}
                } 
                },
                {
                    $unwind:'$product'
                },
                {
                    $project:{
                        item: 1,
                        quantity: 1,
                        product:1,
                        couponstatus:1,
                        couponName:1,
                        coupon:1,
                        couponccode:1,
                        walletamt:1, 
                        wa:"$wallet",
                        Wallet:
                        {
                            $cond: { if: 
                            { $eq: [ "$wallet", true] }, 
                            then: 'checked', 
                            else: 'unchecked'}
                        },


                        total:{
                              
                       
                  
                            $cond: {
                                // if : {$eq:['$product.catoffstatus',true]},
                                // then:{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,'$product.catofferper']},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,'$product.offerper']},'$product.price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                                // else:'$product.price' 
                                if : {$or:[{$eq:['$product.catoffstatus',true]},{$eq:['$product.status',true]}]} ,
                                then:{$subtract:[{$subtract:['$product.price',{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.catofferper',0]}]}]},'$product.price']},100]}]}]},{$subtract:['$product.price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$product.offerper',0]}]}]},'$product.price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                                else:'$product.price'  
    
                                
    
                          } 
                        }
                    }
                }


            ]).toArray();
           //console.log(cartItem)
            resolve(cartItem)
        })

    },

    


    updateAddress:(addressId,Address)=>{

        

        if (Address.check=='checked'){
            chekeddata='checked'
        }else{
            chekeddata= 'uncheked'
        }
        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_ADDRESS_COLLECTION).updateOne({
                _id: objectId(addressId)
            }, {
                $set: {
                    address: Address.address,
                    city:Address.city,
                    zip:Address.zip,
                    saveaddress:Address.saveaddress,
                    check:chekeddata,
                    userId:Address.userId
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    deleteAddress: (Addressid) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_ADDRESS_COLLECTION).remove({_id: objectId(Addressid)}).then((response) => {
                resolve(response)
            })
        })


    },

    getHeader:()=>{
         return new Promise(async (resolve, reject) => {
                let header = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();

                resolve(header)
            })
    },

    getbanner:()=>{
        return new Promise(async (resolve, reject) => {
               let header = await db.get().collection(collection.BANNER_COLLECTION).find().toArray();

               resolve(header)
           })
   }



}
