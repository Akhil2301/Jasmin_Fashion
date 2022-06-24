var db = require('../config/config');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
const {CATEGORY_COLLECTION, SUB_COLLECTION} = require('../config/collection');

const {body} = require('express-validator');

var objectId = require('mongodb').ObjectId


    module.exports = {

        Category: (data) => {
            return new Promise(async (resolve, reject) => {
                db.get().collection(collection.CATEGORY_COLLECTION).insertOne(data).then((response) => {
                    resolve(response)

                })

            })
        },
        viewcategory: (pro) => {
            return new Promise(async (resolve, reject) => {
                let products = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray();

                resolve(products)
            })
        },
        getcategoryDetails: (proid) => {
            return new Promise((resolve, reject) => {

                db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id: objectId(proid)}).then((response) => {
                    resolve(response)
                })
            })
        },
        updateCategory: (catId, catgoryitem) => {
            return new Promise((resolve, reject) => {

                db.get().collection(collection.CATEGORY_COLLECTION).updateOne({
                    _id: objectId(catId)
                }, {
                    $set: {
                        category: catgoryitem.category

                    }
                }).then((response) => {
                    resolve(response)
                })
            })
        },
        deletecategory: (cat_id) => {
            return new Promise((resolve, reject) => {

                db.get().collection(collection.CATEGORY_COLLECTION).remove({_id: objectId(cat_id)}).then((response) => {
                    resolve(response)
                })
            })


        },

        viewbrand: (pro) => {
            return new Promise(async (resolve, reject) => {
                let products = await db.get().collection(collection.BRAND_COLLECTION).find().toArray();

                resolve(products)
            })
        },
        Brand: (data) => {
            return new Promise(async (resolve, reject) => {
                db.get().collection(collection.BRAND_COLLECTION).insertOne(data).then((response) => {
                    resolve(response);

                })

            })
        },
        updatebrand: (brandId, branditem) => {
            return new Promise((resolve, reject) => {

                db.get().collection(collection.BRAND_COLLECTION).updateOne({
                    _id: objectId(brandId)
                }, {
                    $set: {
                        brand: branditem.brand

                    }
                }).then((response) => {
                    resolve(response)
                })
            })
        },
        deletebrand: (brand_id) => {
            return new Promise((resolve, reject) => {

                db.get().collection(collection.BRAND_COLLECTION).remove({_id: objectId(brand_id)}).then((response) => {
                    resolve(response)
                })
            })


        },


        Subcategory: (data) => {
            return new Promise(async (resolve, reject) => {

                db.get().collection(collection.SUB_COLLECTION).insertOne(data).then((response) => {
                    resolve(response);

                })

            })
        },

        viewsubcategory: (pro) => {
            return new Promise(async (resolve, reject) => {
                let subcategory = await db.get().collection(collection.SUB_COLLECTION).aggregate([

                    {
                        $lookup: {
                            from: CATEGORY_COLLECTION,
                            localField: 'catagoryId',
                            foreignField: '_id',
                            as: 'subcategory'

                        }
                    }, {
                        $project: {
                            subCategory: 1,
                            subcategory: {
                                $arrayElemAt: ['$subcategory', 0]
                            }
                        }

                    }


                ]).toArray()
                resolve(subcategory)
              

            })

        },
        updatesubcategory: (subId, subcatitem) => {
            return new Promise((resolve, reject) => {

                db.get().collection(collection.SUB_COLLECTION).updateOne({
                    _id: objectId(subId)
                }, {
                    $set: {
                        catagoryId: objectId(subcatitem.catagoryId),
                        subCategory: subcatitem.subCategory

                    }
                }).then((response) => {
                    resolve(response)
                })
            })
        },
        deletesubCategory: (subcat_id) => {
            return new Promise((resolve, reject) => {

                db.get().collection(collection.SUB_COLLECTION).remove({_id: objectId(subcat_id)}).then((response) => {
                    resolve(response)
                })
            })


        },
        viewproduct: () => {
            return new Promise(async (resolve, reject) => {
                // let products = await db.get().collection(collection.PRODUCT_COLLECTIOS).find().toArray();
                // resolve(products)
                // console.log(new Date())
                let products = await db.get().collection(collection.PRODUCT_COLLECTIOS).aggregate([
                    
                    {
                        $lookup: {
                            from: SUB_COLLECTION,
                            localField: 'subcatagoryId',
                            foreignField: '_id',
                            as: 'subcategory'

                        }
                    }, {
                        $lookup: {
                            from: CATEGORY_COLLECTION,
                            localField: 'catagoryId',
                            foreignField: '_id',
                            as: 'category'

                        }
                    }, 
                    
                    
                    
                    {
                        $project: {
                            "dats": {
                                "$dateToString": {
                                    "format": "%Y-%m-%d",
                                    "date": new Date()
                                }
                            },
                            Name: 1,
                            description: 1,
                            price: 1,
                            images: 1,
                            oferamt: 1,
                            offerper: 1,
                            catofferper: 1,
                            catoffstatus: 1,
                            status: 1,
                            subCategory: 1,
                            subcategory: {
                                $arrayElemAt: ['$subcategory', 0]
                            },
                            catagory: {
                                $arrayElemAt: ['$category', 0]

                            },

                            off: {


                                $cond: {
                                    if  : {
                                        $eq: ['$status', true]
                                    },
                                    then: {
                                        $subtract: [
                                            '$price', {
                                                $divide: [
                                                    {
                                                        $multiply: [
                                                            {
                                                                $subtract: [100, '$fferper']
                                                            },
                                                            '$price'
                                                        ]
                                                    },
                                                    100
                                                ]
                                            }
                                        ]
                                    },
                                    else  : 0


                                    


                                }
                            },


                            // {$multiply: [ '$price','$offer.offerper']}
                            //
                            prooff: {
                                $cond: {
                                    if  : {
                                        $or: [
                                            {
                                                $eq: ['$catoffstatus', true]
                                            }, {
                                                $eq: ['$status', true]
                                            }
                                        ]
                                    },
                                    then: {
                                        $add: [
                                            0, {
                                                $ifNull: ['$offerper', 0]
                                            }
                                        ]
                                    }, // {$subtract:[{$subtract:['$price',{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$catofferper',0]}]}]},'$price']},100]}]}]},{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$offper',0]}]}]},'$price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},,
                                    else  : 1


                                    


                                }
                            },


                            total: {


                                $cond: {
                                    if  : {
                                        $or: [
                                            {
                                                $eq: ['$catoffstatus', true]
                                            }, {
                                                $eq: ['$status', true]
                                            }
                                        ]
                                    },
                                    then: {
                                        $subtract: [
                                            {
                                                $subtract: [
                                                    '$price', {
                                                        $subtract: [
                                                            '$price', {
                                                                $divide: [
                                                                    {
                                                                        $multiply: [
                                                                            {
                                                                                $subtract: [
                                                                                    100, {
                                                                                        $add: [
                                                                                            0, {
                                                                                                $ifNull: ['$catofferper', 0]
                                                                                            }
                                                                                        ]
                                                                                    }
                                                                                ]
                                                                            },
                                                                            '$price'
                                                                        ]
                                                                    },
                                                                    100
                                                                ]
                                                            }
                                                        ]
                                                    }
                                                ]
                                            }, {
                                                $subtract: [
                                                    '$price', {
                                                        $divide: [
                                                            {
                                                                $multiply: [
                                                                    {
                                                                        $subtract: [
                                                                            100, {
                                                                                $add: [
                                                                                    0, {
                                                                                        $ifNull: ['$offerper', 0]
                                                                                    }
                                                                                ]
                                                                            }
                                                                        ]
                                                                    },
                                                                    '$price'
                                                                ]
                                                            },
                                                            100
                                                        ]
                                                    }
                                                ]
                                            }
                                        ]
                                    }, // $divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
                                    else  : '$price'


                                    


                                }
                            }
                        }
                    }
                ]).toArray();
                // console.log(products)
                resolve(products)

            })
        },
        viewsubcategorylist: (pro) => {
            return new Promise(async (resolve, reject) => {
                let products = await db.get().collection(collection.SUB_COLLECTION).find().toArray();

                resolve(products)
            })
        },
        addProducts: (body, files) => {
            body.images = files
            body.price = parseInt(body.price)
            body.catagoryId = objectId(body.catagoryId)
            body.subcatagoryId = objectId(body.subcatagoryId)
            return new Promise((resolve, reject) => {
                db.get().collection(collection.PRODUCT_COLLECTIOS).insertOne(body).then((response) => {
                    resolve(response);
                })
            })
        },
        updateProduct: (prodid, proDetails) => {
            proDetails.price = parseInt(proDetails.price)

            proDetails.catagoryId = objectId(proDetails.catagoryId)
            proDetails.subcatagoryId = objectId(proDetails.subcatagoryId)
            return new Promise((resolve, reject) => {

                db.get().collection(collection.PRODUCT_COLLECTIOS).updateOne({
                    _id: objectId(prodid)
                }, {
                    $set: {
                        Name: proDetails.Name,
                        catagoryId: proDetails.catagoryId,
                        subcatagoryId: proDetails.subcatagoryId,
                        description: proDetails.description,
                        price: proDetails.price

                    }
                }).then((response) => {
                    resolve(response)
                })
            })
        },
        updateProductWithFiles: (id, files) => {
            return new Promise((resolve, reject) => {
                db.get().collection(collection.PRODUCT_COLLECTIOS).updateOne({
                    _id: objectId(id)
                }, {
                    $set: {
                        images: files

                    }
                }).then((reponse) => {
                    resolve(reponse)
                })
            })

        },
        deleteproduct: (proid) => {
            return new Promise((resolve, reject) => {

                db.get().collection(collection.PRODUCT_COLLECTIOS).remove({_id: objectId(proid)}).then((response) => {
                    resolve(response)
                })
            })
        },

        getProductDetails: (productid) => {
            return new Promise(async (resolve, reject) => {
                    // let products = await db.get().collection(collection.PRODUCT_COLLECTIOS).find().toArray();
                        // resolve(products)
                        let products = await db.get().collection(collection.PRODUCT_COLLECTIOS).aggregate([
                            {
                                $match: {
                                    _id: objectId(productid)
                                }
                            }, {
                                $lookup: {
                                    from: SUB_COLLECTION,
                                    localField: 'subcatagoryId',
                                    foreignField: '_id',
                                    as: 'subcategory'

                                }
                            }, {
                                $lookup: {
                                    from: CATEGORY_COLLECTION,
                                    localField: 'catagoryId',
                                    foreignField: '_id',
                                    as: 'category'

                                }
                            }, {
                                $project: {
                                    Name: 1,
                                    description: 1,
                                    price: 1,
                                    images: 1,
                                    offerper: 1,
                                    oferamt: 1,
                                    catofferper: 1,
                                    catoffstatus: 1,
                                    status: 1,
                                    subCategory: 1,
                                    subcategory: {
                                        $arrayElemAt: ['$subcategory', 0]
                                    },
                                    catagory: {
                                        $arrayElemAt: ['$category', 0]
                                    },
                                    // total:{

                                    //     $cond: {
                                    //         if : {$eq:['$offer.status',true]},
                                    //         then:{$divide:[{$multiply:[{$subtract:[100,'$offer.offerper']},'$price']},100]},
                                    //         else:'$price'

                                    // }


                                    // }
total: {
$cond : {
    // if : {$eq:['$catoffstatus',true]},
    // then:{$subtract:[{$subtract:['$price',{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]}]}]},{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,'$offerper']},'$price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
    // else:'$price'


    // if : {$eq:['$catoffstatus',true]}||{$eq:['$status',true]} ,
    // then:{$subtract:[{$subtract:['$price',{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]}]}]},{$subtract:['$price',{$divide:[{$multiply:[{$subtract:[100,{$add:[0,{$ifNull:['$status','$offper',0]}]}]},'$price']},100]}]}]},//$divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
    // else:'$price'
    if : {
        $or : [
            {
                $eq: ['$catoffstatus', true]
            }, {
                $eq: ['$status', true]
            }
        ]


    


},
then : { $subtract: [{$subtract: ['$price', {$subtract: ['$price', {$divide:[{ $multiply:[{$subtract:[100,{$add: [0, { $ifNull: ['$catofferper', 0]   } ]} ]},'$price']},100]}]}]},{$subtract: ['$price', {$divide: [{$multiply: [{$subtract: [100, {$add: [0, { $ifNull: ['$offerper', 0] }]}]},'$price']},100]}]}]}, // $divide:[{$multiply:[{$subtract:[100,'$catofferper']},'$price']},100]},
else  : '$price'

}
}}}]).toArray();
resolve(products[0])
})
},
    updateOffer: (offer, proid) => {
        //console.log("kk")
        oferamt = parseInt((100 - offer.offer) * offer.price / 100)
        oferper = parseInt(offer.offer)
        //console.log("kk")
        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCT_COLLECTIOS).updateOne({
                _id: objectId(proid)
            }, {
                $set: {

                    offerper: oferper,
                    status: true,
                    // strdate:offer.strdate,
                    // enddate:offer.enddate,
                    oferamt: oferamt

                }

            }).then((response) => {
                resolve(response)
            }).catch((err) => {
                console.log('err' + err)
            })
        })

    },

    updateCoupon: (offer, coid) => {
       console
        return new Promise((resolve, reject) => {

            db.get().collection(collection.COUPON_COLLETION).updateOne({
                _id: objectId(coid)
            }, {
                $set: {

                    coupon: offer.coupon,
                    percentage: offer.percentage,
                    startoffer:offer.startoffer,
                    endoffer:offer.endoffer,
                    

                }

            }).then((response) => {
                resolve(response)
            }).catch((err) => {
                console.log('err' + err)
            })
        })

    },




    removeOffer: (proid) => {


        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCT_COLLECTIOS).updateOne({
                _id: objectId(proid)
            }, {
                $set: {

                    status: false,
                    offerper: 0,
                    offeramt: 0


                }
            }).then((response) => {
                resolve(response)
            })
        })

    },

    updatecatOffer: (offer, proid) => {

        // oferamt=parseInt((100-offer.offer)*offer.price/100)
        // oferper=parseInt(offer.offer)

        return new Promise((resolve, reject) => {

            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({
                _id: objectId(proid)
            }, {
                $set: {

                    offerper: parseInt(offer.categoryoffper),
                    status: true,
                    // strdate:offer.categoryoffstrdate,
                    // enddate:offer.categoryoffenddate,
                }

            }).then((response) => {


                resolve(response)
            }).catch((err) => {
                console.log('err' + err)
            })
        })

    },

    updateProductamtcatoff: (offer, proid) => {

        oferper = parseInt(offer.categoryoffper)

        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCT_COLLECTIOS).updateMany({
                catagoryId: objectId(proid)
            }, {
                $set: { // status:true,
                    catofferper: oferper,
                    catoffstatus: true,
                    // catstrdate:offer.categoryoffstrdate,
                    // catenddate:offer.categoryoffenddate,


                }

            }).then((response) => {
                resolve(response)
            }).catch((err) => {
                console.log('err' + err)
            })
        })
    },



    removecatOffer: (offer, proid) => {

        

        return new Promise((resolve, reject) => {

            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({
                _id: objectId(proid)
            }, {
                $set: {

                    offerper: parseInt(0),
                    status: false,
                    // strdate:offer.categoryoffstrdate,
                    // enddate:offer.categoryoffenddate,
                }

            }).then((response) => {


                resolve(response)
            }).catch((err) => {
                console.log('err' + err)
            })
        })

    },

    removeProductamtcatoff: (offer, proid) => {

       

        return new Promise((resolve, reject) => {

            db.get().collection(collection.PRODUCT_COLLECTIOS).updateMany({
                catagoryId: objectId(proid)
            }, {
                $set: { // status:true,
                    catofferper: 0,
                    catoffstatus: false,
                  

                }

            }).then((response) => {
                resolve(response)
            }).catch((err) => {
                console.log('err' + err)
            })
        })
    },



    createReferalValue: (value) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.REFERRAL_COLLETION).updateMany({}, {
                $set: {
                    walletamount: parseInt(value.referaloffamout) 
                }
            }).then((response) => {
                resolve(response)
            })
        })


    },

    refamount:()=>{
         return new Promise(async(resolve,reject)=>{
            let refamount= await db.get().collection(collection.REFERRAL_COLLETION).find().toArray()
         //console.log(refamount[0])
            resolve(refamount[0])
            
         })
    },

    getOrderDetail: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItem = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:{_id:objectId(orderId)}
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
    
    getbannerDetail: (pro) => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray();

            resolve(banner)
        })
    },
    addbanner: (body,image) => {
        body.image=image
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).insertOne(body).then((response) => {
                resolve(response);
            })
        })
    },

    updateBanner: (prodid, proDetails) => {
       
        return new Promise((resolve, reject) => {

            db.get().collection(collection.BANNER_COLLECTION).updateOne({
                _id: objectId(prodid)
            }, {
                $set: {
                    Name: proDetails.Name,
                    caption: proDetails.caption,
                    description: proDetails.description,
                    

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    deletebanner: (proid) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.BANNER_COLLECTION).remove({_id: objectId(proid)}).then((response) => {
                resolve(response)
            })
        })
    },

}
