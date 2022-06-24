var db = require('../config/config');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
const {CATEGORY_COLLECTION, SUB_COLLECTION} = require('../config/collection');

const {body} = require('express-validator');

var objectId = require('mongodb').ObjectId


    module.exports = {

        viewCategoryId: (cat_id) => {
            return new Promise(async (resolve, reject) => {
                // let products = await db.get().collection(collection.PRODUCT_COLLECTIOS).find().toArray();
                // resolve(products)
                // console.log(new Date())
                let products = await db.get().collection(collection.PRODUCT_COLLECTIOS).aggregate([
                    {
                        $match:{
                            catagoryId:objectId(cat_id)
                        }
                    },
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
                    }, {
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
                
                resolve(products)

            })
        },
        priceSort: (price_sort) => {
            return new Promise(async (resolve, reject) => {
               console.log(price_sort)
                
                let upperdata=parseInt(price_sort)
                let lowerdata=parseInt(price_sort)-500
                if(price_sort===2499){
                    lowerdata=parseInt(price_sort)-501 
                }
                if(parseInt(price_sort)===2500){
                maxamount=await db.get().collection(collection.PRODUCT_COLLECTIOS).find({}).sort({price:-1}).limit(1).toArray();
                    upperdata=parseInt(maxamount[0].price) ;
                }
               


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
                    }, {
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
                    },{
                       $match:{
                          
                          $and: [ { total: { $gt:parseInt(lowerdata)  } }, { total: { $lt: parseInt(upperdata) } } ] 
                       }
                    }
                ]).toArray();
                
                resolve(products)

            })
        }
    


}
