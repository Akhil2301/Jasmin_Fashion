var db = require('../config/config');
var collection = require('../config/collection');
const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');
var objectId = require('mongodb').ObjectId


module.exports = {
    emailcheck: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email: data.email});
            if (admin) {
                resolve({status: true})
            } else {
                resolve({status: false})

            }
        })

    },
    phonecheck: (data) => {
        return new Promise(async (resolve, reject) => {
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({phone: data.phone});
            if (admin) {
                resolve({status: true})
            } else {
                resolve({status: false})

            }
        })

    },

    doLogin: (adminData) => {

        return new Promise(async (resolve, reject) => {
            let loginStatus = false;
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({email: adminData.email});

            if (admin) {
                console.log(adminData.password)
                console.log(admin.password)

                let rep = await bcrypt.compare(adminData.password, admin.password)

                if (rep) {
                    response.admin = admin

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

    viewuser: (pro) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.USER_COLLECTION).find().toArray();
            resolve(products)
        })
    },
    updateUser: (prodid, userDetails) => {
        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: objectId(prodid)
            }, {
                $set: {
                    fname: userDetails.fname,
                    lname: userDetails.lname

                }
            }).then((response) => {
                resolve(response)
            })
        })
    },

    deleteUser: (proid, status) => {
        if (status == 'false') {
            status = false
            console.log('ss')
        } else {
            status = true
        }

        return new Promise((resolve, reject) => {

            db.get().collection(collection.USER_COLLECTION).updateOne({
                _id: objectId(proid)
            }, {
                $set: {
                    status: status
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getOrderList: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                    "$project": {
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
                }]).sort({dat: -1}).toArray()

            resolve(orders)
        })
    },
    updateOrderStaus: (body) => {
        console.log(body)
        if (body.status == 'dispatch') {
            placed = false,
            cancel = false,
            dispatch = true,
            shipped = false,
            delivered = false
        }
        if (body.status == 'placed') {
            placed = true,
            cancel = false,
            dispatch = false,
            shipped = false,
            delivered = false
        }
        if (body.status == 'cancel') {
            placed = false,
            cancel = true,
            dispatch = false,
            shipped = false,
            delivered = false
        }
        if (body.status == 'shipped') {
            placed = false,
            cancel = false,
            dispatch = false,
            shipped = true,
            delivered = false
        }
        if (body.status == 'delivered') {
            placed = false,
            cancel = false,
            dispatch = false,
            shipped = false,
            delivered = true
        }


        return new Promise((resolve, reject) => {

            db.get().collection(collection.ORDER_COLLECTION).updateOne({
                _id: objectId(body.orderId)
            }, {
                $set: {
                    status: {
                        placed: placed,
                        cancel: cancel,
                        dispatch: dispatch,
                        shipped: shipped,
                        delivered: delivered

                    }
                }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    getMonthReport: ((previousMonth) => {
        return new Promise(async (resolve, reject) => {
            let monthlyReport = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                                                                    
                {
               $match:{dat: {
                $gte: previousMonth
            },}
                },
                {
                    "$project": {
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
              
            ]).sort({dat: -1}).toArray()
            resolve(monthlyReport)

        })
    }),
    getdailyReport: ((today) => {
        return new Promise(async (resolve, reject) => {
            let monthlyReport = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
               
  
                [//{$match:{dat:{$gte: today}}},
                    
                    {
                

                    "$project": {
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
                }]



            ).sort({dat: -1}).toArray()
            resolve(monthlyReport)

        })
    }),

    getdailyReports: ((today) => {
        return new Promise(async (resolve, reject) => {
            let monthlyReport = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
               
  
                [//{$match:{dat:{$gte: today}}},
                    
                    {
                

                    "$project": {
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
                }]



            ).sort({dat: 1}).toArray()
            resolve(monthlyReport)

        })
    }),

    totalorder: () => {
        return new Promise(async (resolve, reject) => {
            let totalorder = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $group: {
                        _id: null,
                        count: {
                            $sum: 1
                        }
                    }
                }, {
                    $project: {
                        _id: 0
                    }
                }


            ]).toArray()
            resolve(totalorder[0])

        })
    },
    totalsale: () => {
        return new Promise(async (resolve, reject) => {
            let totalsale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([{
                    $group: {
                        _id: null,
                        TotalSum: {
                            $sum: "$totalAmount"
                        }
                    }
                }]).toArray()
            resolve(totalsale[0])

        })
    },
    todaysale: () => {
        todaysaledata= new Date()
        return new Promise(async (resolve, reject) => {
            let todaysale = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: {
                        dat: {
                            $gt:new Date(new Date().setDate(new Date().getDate()-1))
                        }

                    }
                },
                {
                   
                    $group: {
                        _id: null,
                        TotalSum: {
                            $sum: "$totalAmount"
                        }
                    }
                }

            ]).toArray()

            resolve(todaysale[0])

        })
    },
    orderperday: () => {
        return new Promise(async (resolve, reject) => {
            let orderperday = await db.get().collection(collection.ORDER_COLLECTION).aggregate([

                {
                    $group: {
                        _id: {
                            day: {
                                $dayOfWeek: "$dat"

                            }
                        },


                        TotalSum: {
                            $sum: "$totalAmount"
                        }
                    }
                }

            ]).sort(                                              

                {"_id.day":  1}
            ).toArray()

            resolve(orderperday)

        })
    },
    










    addCouponToDataBase: (data) => {
        data.percentage = parseInt(data.percentage)
        return new Promise((resolve, resject) => {
            db.get().collection(collection.COUPON_COLLETION).insertOne(data).then(() => {
                resolve()
            })
        })

    },
    getCoupon: () => {
        return new Promise(async (resolve, reject) => {
            await db.get().collection(collection.COUPON_COLLETION).find().toArray().then((response) => {
                resolve(response)
            })
        })
    },
    
    deleteCoupon: (id) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLETION).remove({ _id: objectId(id.id) }).then(() => {
                resolve()
            })
        })
    },
    SalePerMonth: () => {
        return new Promise(async (resolve, reject) => {
            let orderperday = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
             
             


                {
                    $group: {
                        _id:{$dateToString:{format: "%Y-%m-%d", date: "$dat"}
                        },

 
                        TotalSum: {
                            $sum: "$totalAmount"
                        },

                        walletpay: {
                            $sum: "$Walletpay"
                        },
                      
                    }
                }

            ]).toArray()
          
            resolve(orderperday)

        })
    },


    paymentMethod:(cod)=>{
        return new Promise(async (resolve, reject) => {
            let orderperday = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
             
             {$match:{
                paymentMethod:cod
             }
            },
            {
                $count:
                    'paymentMethod'
                
            }


               

            ]).toArray()
           //console.log(orderperday[0])
            resolve(orderperday[0])

        })
    }
    

}
