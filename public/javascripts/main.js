// const dotenv=require('dotenv');
// dotenv.config({path:'./config/config.env'})


// var header = document.getElementById("sidebar");
// var btns = header.getElementsByTagNameNS("a");
// for (var i = 0; i < btns.length; i++) {
//   btns[i].addEventListener("click", function() {
//   var current = document.getElementsByClassName("active");
//   current[0].className = current[0].className.replace(" active", "");
//   this.className += " active";
//   });
// }



/* cart ajax */


function addtocart(proId){
   
  $.ajax({
     url:'/add-to-cart/'+proId,
     method:'get',
     success:(response)=>{
         if(response.status){
           let count=$('#cart-count').html()
          
           count=parseInt(count)+response.cnt
           //location.reload()
           $('#cart-count').html(count)
           
         }
     }
  })
  }

  /*cart ajaxe*/

function change(cartId,proId,userId,count){

    let quantity=parseInt(document.getElementById(proId).value)
    count=parseInt(count)
      $.ajax({
        url:'/change-product-quantity',
        data:{
          user:userId,
          cart:cartId, 
          product:proId,
          count:count,
          quantity:quantity
        },
        method:'post',
      
        success:(response)=>{
    
         if(response.removeProduct){
          
           location.reload(); 
    
         }else{
           
          //document.getElementById(proId).innerHTML=quantity+count
         // document.getElementById('total').innerHTML=response.total
        
          location.reload()
         }
        }
      })
    }


    $("input[name='paymentMethod']").click(function () {
      divdata=document.getElementById('payment');
      
      if ($(this).val() === 'razorpay') {
       divdata.innerHTML=`<hr class="mb-4">
                  <button class="btn btn-primary bg-primary btn-lg btn-block text-info" type="submit"
                    id="rzp-button1">CHECKOUT</button>`
      }
      else {
  divdata.innerHTML=`<hr class="mb-4">
                  <button class="btn btn-primary bg-primary btn-lg btn-block text-info" type="submit"
                    >CHECKOUT</button>`
      }
  
    });
  
    $("#checkout-form").submit((e) => {
  
      e.preventDefault();
      $.ajax({
        url: '/place-order',
        method: 'post',
        data: $('#checkout-form').serialize(),
        success: (response) => {
          if (response.codsuccess) {
            location.href = '/order-success'
          }
          else if (response.paypal) {
  
            paypalPayment(response, response.data)
          }
          else {
  
            razorpayPayment(response.data, response)
  
          }
  
        }
      })
    })
  
    function paypalPayment(data, body) {
  
      for (let i = 0; i < data.links.length; i++) {
        if (data.links[i].rel === 'approval_url') {
          // console.log(('approval_url'))
          window.location.href = (data.links[i].href);
          // let link=(data.links[i].href);
  
        }
      }
  
    }
  
    function razorpayPayment(body, order) {
        var options = {
        "key": 'rzp_test_Vldb0EmPlRSPUM', // Enter the Key ID generated from the Dashboard
        "amount": order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Jasmin Fashions",
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
          /*alert(response.razorpay_payment_id);
          alert(response.razorpay_order_id);
          alert(response.razorpay_signature)*/
          //console.log(order)
          verifyPayment(response, order, body)
  
        },
        "prefill": {
          "name": "Gaurav Kumar",
          "email": "gaurav.kumar@example.com",
          "contact": "9999999999"
        },
        "notes": {
          "address": "Razorpay Corporate Office"
        },
        "theme": {
          "color": "#3399cc"
        }
      };
      var rzp1 = new Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        //alert("somes")
  
      });
      document.getElementById('rzp-button1').onclick = function (e) {
        rzp1.open();
        e.preventDefault();
      }
  
  
    }
  
    function verifyPayment(payment, order, body) {
     
      $.ajax({
        url: '/verify-payment',
        data: {
          payment,
          order,
          body
        },
        method: 'post',
  
  
        success: (response) => {
          if (response) {
            location.href = '/order-success'
          }
          else {
            alert("payment Failed")
          }
  
        }
  
      })
    }
  
    function wallet(id, wallet) {
      if (document.getElementById('flexCheckDefault').checked) {
  
  
        $.ajax({
          url: '/wallet',
          data: {
            userid: id,
            wallet: wallet
          },
          method: 'post',
          success: (response) => {
  
            location.reload()
  
  
          }
        })
  
      }
      else {
        //alert('dd')
          $.ajax({
          url: '/walletremove',
          data: {
            userid: id,
            wallet: wallet
          },
          method: 'post',
          success: (response) => {
  
            location.reload()
  
  
          }
        })
      }
  
  
    }






    $('input[name=price]').change(() => {

      let div = document.getElementById('sortdata')


      var value = $('input[name=price]:checked').val();


      $.ajax({
          url: '/shopsort/' + value,
          method: 'post',
          data: $('#price').serialize(),
          success: (response) => {
            
              div.innerHTML = ""
              for (let i = 0; i < response.a.length; i++) {
                tot=0
                if (response.a[i].status){
                  if (response.a[i].catoffstatus){
                      tot=response.a[i].offerper+ response.a[i].catofferper
                  }
                  else{
                    tot=response.a[i].offerper
                  }
                }
                else{
                  if (response.a[i].catoffstatus){
                    tot=response.a[i].catofferper
                  }
                  else{
                    tot=0
                  }
                }



                  div.innerHTML += ` 
        <div class="col-lg-4 col-md-6 col-sm-6">
                      <div class="product__item">
                          <div class="product__item__pic" style="background-image:url('/uploads/${response.a[i].images[0]}')">
                          <h5><span class="badge text-danger ms-2">${tot}% off</span></h5>

                              <ul class="product__hover">

                                  <li><a href="/product-details/${response.a[i]._id}"><img src="/user/img/icon/compare.png"
                                              alt="">
                                          <span>Go To detail</span></a></li>
                                  
                                  <li><a onclick="addtocart('${response.a[i]._id}')"><img src="/user/img/icon/cart.png" alt="">
                                          <span>+Add to cart</span></a></li>

                              </ul>
                          </div>
                          <div class="product__item__text">
                              <h6>${response.a[i].Name}</h6>
                              <a class="btn add-cart" onclick="addtocart('{{this._id}}')">
                                  + Add To cart

                              </a>
<s>&#x20B9; ${response.a[i].price}</s><strong class="ms-2 text-danger"> &#x20B9; ${response.a[i].total}</strong>
                             


                          </div>
                      </div>
                  </div>
                       `


              }

          }
      })
  })

function catsort(e,id){
   
e.preventDefault()
      let div = document.getElementById('sortdata')


     


      $.ajax({
          url: '/categorysort/'+id,
          method: 'post',
          data: $('#price').serialize(),
          success: (response) => {
              console.log(response.a)
              div.innerHTML = ""
              for (let i = 0; i < response.a.length; i++) {
                tot=0
                if (response.a[i].status){
                  if (response.a[i].catoffstatus){
                      tot=response.a[i].offerper+ response.a[i].catofferper
                  }
                  else{
                    tot=response.a[i].offerper
                  }
                }
                else{
                  if (response.a[i].catoffstatus){
                    tot=response.a[i].catofferper
                  }
                  else{
                    tot=0
                  }
                }

                  div.innerHTML += ` 
        <div class="col-lg-4 col-md-6 col-sm-6">
                      <div class="product__item">
                          <div class="product__item__pic" style="background-image:url('/uploads/${response.a[i].images[0]}')">
                          
                        

                          <h5><span class="badge text-danger ms-2">${tot}% off</span></h5>
                         






                              <ul class="product__hover">

                                  <li><a href="/product-details/${response.a[i]._id}"><img src="/user/img/icon/compare.png"
                                              alt="">
                                          <span>Go To detail</span></a></li>
                                 
                                  <li><a onclick="addtocart('${response.a[i]._id}')"><img src="/user/img/icon/cart.png" alt="">
                                          <span>+Add to cart</span></a></li>

                              </ul>
                          </div>
                          <div class="product__item__text">
                              <h6>${response.a[i].Name}</h6>
                              <a class="btn add-cart" onclick="addtocart('{{this._id}}')">
                                  + Add To cart

                              </a>
<s>&#x20B9; ${response.a[i].price}</s><strong class="ms-2 text-danger"> &#x20B9; ${response.a[i].total}</strong>
                             


                          </div>
                      </div>
                  </div>
                       `


              }

          }
      })
  
}
  
 