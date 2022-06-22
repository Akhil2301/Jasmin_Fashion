var express = require('express');
const {ObjectId} = require('mongodb');
const adminHelpers = require('../helpers/admin-helpers');
const productHelper = require('../helpers/product-helpers');
const multer=require('multer');

const WEEK_SECONDS = 7 * 24 * 60 * 60 * 1000;
const MONTH_SECONDS = 30 * 24 * 60 * 60 * 1000;
const YEAR_SECONDS = 365.25 * 24 * 60 * 60 * 1000;

const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,'./public/uploads')
    },
    filename:function(req,file,cb){
        var ext=file.originalname.substr(file.originalname.lastIndexOf('.'))
        cb(null,file.fieldname+'-'+Date.now()+'new'+ext)
    }
});
const upload=multer({storage:storage})


var router = express.Router();


const verifyLogin = (req, res, next) => {
    if (req.session.loggedInadmin) {
        next();
    } else {
        res.redirect('/admin/')
    }
}


/* GET home page. */
router.get('/', async (req, res, next) =>{
try{
    if (req.session.admin) {
        let totalorder= await adminHelpers.totalorder();
        let totalsale= await adminHelpers.totalsale()
        let todaysale= await adminHelpers.todaysale()
        let orderperday= await adminHelpers.orderperday()
        
        let COD= await adminHelpers.paymentMethod('COD')
        let razorpay= await adminHelpers.paymentMethod('razorpay')
        let paypal= await adminHelpers.paymentMethod('paypal')
       // console.log(todaysale)
        res.render('admin/index', {
           
            admins: true,
            admin: req.session.admin,
            ad_log:true,
            totalorder:totalorder,
            totalsale:totalsale,
            todaysale:todaysale,
            orderperday:orderperday,
            COD:COD,
            razorpay:razorpay,
            paypal:paypal
        });
    } else {

        res.render('admin/admin-log', {admins: true,ad_log:false});
    }
  }catch{
    res.redirect('/404')
  }
});

/*post login Page.*/
router.post('/', function (req, res, next) {
try{
    adminHelpers.doLogin(req.body).then((response) => {
        if (response.status) {

            req.session.admin = response.admin

            req.session.loggedInadmin = true
            // res.render('user/index',{user:req.session.user})

            res.redirect('/admin/')


        } else {
            req.session.loggedErr = true
            req.session.loggedInadmin = false
            if (req.session.loggedInadmin) {
                res.redirect('/admin/')
            } else {
                res.render('admin/admin-log', {
                    admins: true,
                    err_msg: 'Enter the correct credential',
                    ad_log:false
                })
            }


        }
    })
  }catch{
    res.redirect('/404')
  }
});


/****** logout page*******/

router.get('/logout', verifyLogin, (req, res, next) => {
  try{
    req.session.destroy()
    res.redirect('/admin/')
  }catch{
    res.redirect('/404')
  }
})

/*******  Add category ****************/
router.get('/category', verifyLogin, async (req, res, next) => {
try{
    let categorylist = await productHelper.viewcategory()
    let brandlist = await productHelper.viewbrand()
    let subcategorylist = await productHelper.viewsubcategory()


    res.render('admin/category', {
        admins: true,
        categorylist,
        subcategorylist,
        brandlist,
        admin: req.session.admin,
        ad_log:true
    })
  }catch{
    res.redirect('/404')
  }
})

/*******  Add category end ****************/


/*******  Add category post ****************/
router.post('/category', verifyLogin, (req, res) => {
try{
    productHelper.Category(req.body).then((response) => {
        res.redirect('/admin/category')
    })
  }catch{
    res.redirect('/404')
  }
})
/*******  Add category post end ****************/

/*******  Edit category  ****************/
router.post('/edit-category/:id', verifyLogin, async (req, res) => {
try{
    productHelper.updateCategory(req.params.id, req.body).then((response) => {
        res.redirect('/admin/category')
    })
  }catch{
    res.redirect('/404')
  }
})

/*******  Edit category  end ****************/
/*******  delete category  start ****************/

router.get('/delete-category/:id', verifyLogin, async (req, res) => {
try{
    productHelper.deletecategory(req.params.id).then((response) => {

        res.redirect('/admin/category');

    })
  }catch{
    res.redirect('/404')
  }
})

/*******  delete category  end ****************/


/*******  Add Brand ****************/
router.post('/brand', verifyLogin, async (req, res) => {
  try{
    productHelper.Brand(req.body).then((response) => {
        res.redirect('/admin/category')
    })
  }catch{
    res.redirect('/404')
  }
})

/*******  Add Brand end ****************/

/*******  Edit brand  ****************/
router.post('/edit-brand/:id', verifyLogin, async (req, res) => {
try{
    productHelper.updatebrand(req.params.id, req.body).then((response) => {
        res.redirect('/admin/category')
    })
  }catch{
    res.redirect('/404')
  }
})

/*******  Edit brand  end ****************/

/*******  delete category  start ****************/

router.get('/delete-brand/:id', verifyLogin, async (req, res) => {
try{
    productHelper.deletebrand(req.params.id).then((response) => {

        res.redirect('/admin/category');

    })
  }catch{
    res.redirect('/404')
  }
})

/*******  delete category  end ****************/

/*******  Add Sub category ****************/
router.post('/subcategory', verifyLogin, async (req, res) => {
  try{
    req.body.catagoryId = ObjectId(req.body.catagoryId)

    productHelper.Subcategory(req.body).then((response) => {
        res.redirect('/admin/category')
    })
  }catch{
    res.redirect('/404')
  }
})

/*******  Edit sub category start ****************/


router.post('/edit-subcategory/:id', verifyLogin, async (req, res) => {
    //console.log(req.params.id)
   // console.log(req.body)
   try{
    productHelper.updatesubcategory(req.params.id, req.body).then((response) => {
        res.redirect('/admin/category')
    })
  }catch{
    res.redirect('/404')
  }
})

/*******  Edit sub  end ****************/

/*******  delete category  start ****************/

router.get('/delete-subcategory/:id', verifyLogin, async (req, res) => {
try{
    productHelper.deletesubCategory(req.params.id).then((response) => {

        res.redirect('/admin/category');

    })
  }catch{
    res.redirect('/404')
  }
})

/*******  delete category  end ****************/


/************ View product *******/
router.get('/product', verifyLogin,async(req, res, next)=> {
  try{
    let categorylist = await productHelper.viewcategory()
    let brandlist = await productHelper.viewbrand()
    let subcategorylist = await productHelper.viewsubcategorylist()
   

    productHelper.viewproduct().then((products => {
        res.render('admin/product', {
            admins: true,
            categorylist,
            subcategorylist,
            brandlist,
            admin: req.session.admin,
            product:products,
            ad_log:true
        })
    })).catch((err) => {
        console.log(`error${err}`)
    })
  }catch{
    res.redirect('/404')
  }
});
router.post('/product',verifyLogin,upload.array('image',12),(req,res)=>{
try{
    let arr=[]

    req.files.forEach(function(files,index,ar){     
  
      arr.push(req.files[index].filename)

    })

   productHelper.addProducts(req.body,arr).then(()=>{
     res.redirect('/admin/product')
     
   })
  }catch{
    res.redirect('/404')
  }
})


router.post('/edit-product/:id',verifyLogin,async(req,res)=>{  
   
     try{
    productHelper.updateProduct(req.params.id,req.body).then((response)=>{
        res.redirect('/admin/product')})
     
    }catch{
      res.redirect('/404')
    }
  })


  router.post('/edit-image/:id',verifyLogin,upload.array('images',12),(req,res)=>{
 try{
    let arr=[]
    req.files.forEach((files,index,array)=>{
    
      arr.push(req.files[index].filename)
    })
    
      productHelper.updateProductWithFiles(req.params.id,arr).then(()=>{

        res.redirect('/admin/product')
    
      })
    }catch{
      res.redirect('/404')
    }
  })


  router.get('/delete-product/:id', verifyLogin, async (req, res) => {
try{
    productHelper.deleteproduct(req.params.id).then((response) => {

        res.redirect('/admin/product');

    })
  }catch{
    res.redirect('/404')
  }
})

router.get('/user',verifyLogin,(req,res)=>{

  
    adminHelpers.viewuser().then((userlist=>{    
    
         res.render('admin/user',{
            userlist,
            admin:req.session.admin,
            admins:true,
            ad_log:true
        })       
     
    })).catch((err)=>{
     // console.log(`error${err}`)
     res.redirect('/404')
    })

    
  })

  router.post('/edit-user/:pid',(req,res)=>{
  try{
    adminHelpers.updateUser(req.params.pid,req.body).then((response)=>{
      res.redirect('/admin/user');
  
    
    })
  }catch{
    res.redirect('/404')
  }
  })

  router.get('/delete-user/:id/:stat',(req,res)=>{
    try{
    let proid=req.params.id
    let status=req.params.stat
   console.log(status)
    
    adminHelpers.deleteUser(proid,status).then((response)=>{
      
      res.redirect('/admin/user');
     
    })
  }catch{
    res.redirect('/404')
  }
  })

  router.get('/order',verifyLogin,async(req,res)=>{

  try{
    let orders=await adminHelpers.getOrderList()
    
    res.render('admin/order',{admin: req.session.admin,orders,admins:true,ad_log:true,})
  }catch{
    res.redirect('/404')
  }
  })
  
  
  router.post('/dispatch-order',(req,res)=>{  
  try{
    adminHelpers.updateOrderStaus(req.body).then(async(response)=>{    
      
      res.redirect('/admin/order') 
  
    
    })
  }catch{
    res.redirect('/404')
  }
  })
  
  router.get('/offer', verifyLogin, async(req, res) => {
  try{
    let categorylist = await productHelper.viewcategory()
    let brandlist = await productHelper.viewbrand()
    let subcategorylist = await productHelper.viewsubcategorylist()
   

    productHelper.viewproduct().then((products => {
        console.log(products)
        res.render('admin/offer', {
            admins: true,
            categorylist,
            subcategorylist,
            brandlist,
            admin: req.session.admin,
            product:products,
            ad_log:true
        })
    })).catch((err) => {
        //console.log(`error${err}`)
        res.redirect('/404')
    })
  }catch{
    res.redirect('/404')
  }
})
  

router.post('/offer/:id',(req,res)=>{  
  try{
    productHelper.updateOffer(req.body,req.params.id).then(async(response)=>{    
      
      res.redirect('/admin/offer') 
  
    
    })
  }catch{
    res.redirect('/404')
  }
  })

  
  

router.get('/Offer-remove/:id',(req,res)=>{
  try{
    productHelper.removeOffer(req.params.id).then(async(response)=>{    
      
        res.redirect('/admin/offer') 
    
      
      })
    }catch{
      res.redirect('/404')
    }
})  

router.get('/monthlyreport', verifyLogin, async(req, res)=>{
    try{
    let nowDate = new Date();
    let previousMonth = new Date(nowDate - MONTH_SECONDS)
    adminHelpers.getMonthReport(previousMonth).then((response) => {
      report = response
     res.render('admin/monthlyreport', { report, admin: req.session.admin,admins:true, ad_log:true })
    })
  }catch{
    res.redirect('/404')
  }
  })

  router.get('/weeklyreport', verifyLogin, async(req, res)=>{
    try{
    let nowDate = new Date();
    let previousweek = new Date(nowDate - WEEK_SECONDS)
    adminHelpers.getMonthReport(previousweek).then((response) => {
      report = response

     res.render('admin/weeklyreport', { report, admin: req.session.admin,admins:true , ad_log:true})
    })
  }catch{
    res.redirect('/404')
  }
  })


  router.get('/yearlyreport', verifyLogin, async(req, res)=>{
    try{

    
    let nowDate = new Date();
    let previousyear = new Date(nowDate - YEAR_SECONDS)
    adminHelpers.getMonthReport(previousweek).then((response) => {
      report = response
      
      

     res.render('admin/yearlyreport', { report, admin: req.session.admin,admins:true,ad_log:true ,totalam})
    })
  }catch{
    res.redirect('/404')
  }
  })

  router.get('/dailyreport', verifyLogin, async(req, res)=>{
    
    try{
    let nowDate = new Date();
    head_data=""
    adminHelpers.SalePerMonth().then((response) => {
      report = response
      totalam=0
      walpay=0
      let tot= response.filter(function(a) {
        
      
         totalam=totalam+a.TotalSum
         walpay=walpay+a.walletpay
      
       
      });




     res.render('admin/daywisereport', { report, admin: req.session.admin,admins:true,ad_log:true,head_data,totalam,walpay})
    })
  }catch{
    res.redirect('/404')
  }
  })

  router.post('/dailyreport', verifyLogin, async(req, res)=>{
    
    try{
    adminHelpers.SalePerMonth().then((response) => {
    //   report = response

    
    var startDate = req.body.fromdate;
    var endDate = req.body.todate;
    var strDat=new Date(startDate);
    var endDat=new Date(endDate);
    var totalam=0
    var walpay=0
    head_data=`From ${startDate} To ${endDate}`
      let report = response.filter(function(a) {
        
        var d1 = new Date(a._id);
         
   if(d1>strDat && d1< endDat){
    totalam=totalam+a.TotalSum
    walpay=walpay+a.walletpay
   }

      return d1>strDat && d1< endDat
      
       
      });
     
      
        
   
     res.render('admin/daywisereport', {startDate,endDate, report, admin: req.session.admin,admins:true,ad_log:true,head_data,totalam,walpay},function(err,html){
        res.send(html)
     })

    })


  }catch{
    res.redirect('/404')
  }


  })



  // ......................Coupon management.....................................

router.get('/coupon',verifyLogin, (req, res) => {
  try{
    adminHelpers.getCoupon().then((coupon) => {
      //console.log(coupon);
      res.render('admin/coupon', { admins: true, coupon ,admin: req.session.admin,activecoupon:true,ad_log:true})
    })
  }catch{
    res.redirect('/404')
  }
  })
  
  router.post('/addCoupon', verifyLogin,(req, res) => {
  try{
   // console.log(req.body);
    adminHelpers.addCouponToDataBase(req.body).then(() => {
      res.redirect('/admin/coupon')
    })
  }catch{
    res.redirect('/404')
  }
  })


  router.post('/edit-coupon/:id',(req,res)=>{  
  try{
    productHelper.updateCoupon(req.body,req.params.id).then(async(response)=>{    
      
      res.redirect('/admin/coupon') 
  
    
    })
  }catch{
    res.redirect('/404')
  }
  })


  

  
  router.get('/delete-coupon/:id',verifyLogin,(req,res)=>{
    // console.log('params');
    // console.log(req.params);
    try{
    adminHelpers.deleteCoupon(req.params).then(()=>{
      res.redirect("/admin/coupon")
    })
  }catch{
    res.redirect('/404')
  }
  })
  
  router.post('/removeCoupon',verifyLogin, (req, res) => {
    try{
    adminHelpers.removeCoupon(req.body.userid).then((response) => {
      res.json(response)
    })
  }catch{
    res.redirect('/404')
  }
  })

  router.get('/categoryoff', verifyLogin, async (req, res, next) => {
try{
    let categorylist = await productHelper.viewcategory()
    
    res.render('admin/categoryoff', {
        admins: true,
        categorylist,        
        admin: req.session.admin,
        ad_log:true
    })
  }catch{
    res.redirect('/404')
  }
})

router.post('/categoryoff/:id', verifyLogin, async (req, res, next) => {
 try{
  productHelper.updatecatOffer(req.body,req.params.id).then(async(response)=>{ 
    productHelper.updateProductamtcatoff(req.body,req.params.id).then(async(response)=>{
      res.redirect('/admin/categoryoff') 
    })   
   
  })
}catch{
  res.redirect('/404')
}
})

router.get('/delete-categoryoff/:id', verifyLogin, async (req, res, next) => {
 try{
  productHelper.removecatOffer(req.body,req.params.id).then(async(response)=>{ 
    productHelper.removeProductamtcatoff(req.body,req.params.id).then(async(response)=>{
      res.redirect('/admin/categoryoff') 
    })   
   
  })
}catch{
  res.redirect('/404')
}
})








/* GET home page. */
router.get('/referalcode',verifyLogin, async (req, res, next) =>{
try{
 let referalamount=await productHelper.refamount()
    
   
      res.render('admin/refferalgenerator', { 
          admins: true,
          admin: req.session.admin,
          ad_log:true,
          referalamount:referalamount
      });
    }catch{
      res.redirect('/404')
    }
});

// router.post('/refferelcode', verifyLogin, async (req, res) => {
 

//   productHelper.createReferalValue(req.body).then((response) =>{
//     res.redirect('/admin/referalcode')  
   
// })

  
  
// })

router.post('/refferelcode', verifyLogin, (req, res) => {
try{
  productHelper.createReferalValue(req.body).then((response) => {
      res.redirect('/admin/referalcode')
  })
}catch{
  res.redirect('/404')
}
})

router.get('/orderdetail/:id', verifyLogin, async (req, res) => {
  try{
  let orders = await productHelper.getOrderDetail(req.params.id)
 
  res.render('admin/order-detail', {
    admins: true,
    admin: req.session.admin,
    ad_log:true,
    orders
  })
}catch{
  res.redirect('/404')
}
})




module.exports = router;
