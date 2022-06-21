
   
/*************validate Address ******/
const formcategory = document.getElementById('categoryform')



    
formcategory.addEventListener('submit', (ev) => {
    const category = document.getElementById('category').value
    

    if (category == ''||!category.match(/[A-Za-z]$/)) {
        if(category == ''){
            document.getElementById('category-error').innerHTML = 'Category Required ..!';
        }
        else{
            document.getElementById('category-error').innerHTML = "Can't use special Characters ..!";
        }
        ev.preventDefault()

    } else {
        document.getElementById('category-error').innerHTML = '';
    }

    


})
/******* End ******/

function categoryvalid(ev,id,err){
   
    var category = document.getElementById(id).value
    
   
    if (category == ''||!category.match(/[A-Za-z]$/)) {
       
        
        if(category == ''){
            document.getElementById(err).innerHTML = 'Category Required ..!';
        }
        else{
            
           document.getElementById(err).innerHTML = "Can't use special Characters ..!";
        }
        ev.preventDefault()

    } else {
        document.getElementById(err).innerHTML = '';
    }



}


/*************validate Sub category ******/
const formsubcategory = document.getElementById('subcategory')



    
formsubcategory.addEventListener('submit', (ev) => {
    const subcategory = document.getElementById('subcategory_id').value
    
    const catid=document.getElementById('categoryId').value

    if (subcategory == ''||!subcategory.match(/[A-Za-z]$/)) {
        if(subcategory == ''){
            document.getElementById('sub-error').innerHTML = 'Sub Category Required ..!';
        }
        else{
            document.getElementById('sub-error').innerHTML = "Can't use special Characters ..!";
        }
        ev.preventDefault()

    } else {
        document.getElementById('sub-error').innerHTML = '';
    }

    if(catid=='Catagory list'){
        document.getElementById('cat-error').innerHTML = "Choose a Category ..!";
        ev.preventDefault()
    }else{
        document.getElementById('cat-error').innerHTML = "";
    }
    


})
/******* End ******/


function subvalidate(ev,id,err){
   
   
    var subcategory = document.getElementById(id).value
    
   
    if (subcategory == ''||!subcategory.match(/[A-Za-z]$/)) {
       
        
        if(subcategory == ''){
            document.getElementById(err).innerHTML = 'Sub Category Required ..!';
        }
        else{
            
           document.getElementById(err).innerHTML = "Can't use special Characters ..!";
        }
        ev.preventDefault()

    } else {
        document.getElementById(err).innerHTML = '';
    }



}




/*************validate Sub category ******/
const formbrand = document.getElementById('brand')



    
formbrand.addEventListener('submit', (ev) => {
    const brandname = document.getElementById('brandname').value
    
    

    if (brandname == ''||!brandname.match(/^[a-zA-Z]+$/)) {
        if(brandname == ''){
            document.getElementById('brand-error').innerHTML = 'Brand Name Required ..!';
        }
        else{
            document.getElementById('brand-error').innerHTML = "Can't use special Characters ..!";
        }
        ev.preventDefault()

    } else {
        document.getElementById('brand-error').innerHTML = '';
    }

    
    


})
/******* End ******/


function brandvalidate(ev,id,err){
   
   
    var brandca= document.getElementById(id).value
    
    
    if (brandca == ''||!brandca.match(/^[a-zA-Z]+$/)) {
       
        
        if(brandca == ''){
            document.getElementById(err).innerHTML = 'Brand Required ..!';
        }
        else{
           
           document.getElementById(err).innerHTML = "Can't use special Characters ..!";
        }
        ev.preventDefault()

    } else {
       document.getElementById(err).innerHTML = '';
    }



}



/*************validate Sub category ******/

function Offervalidate(e){
    const off=document.getElementById('offer_per').value
    

    if(off==''||!off.match(/[0-9]/)){
      
       if(off==''){

        document.getElementById('offer-error').innerHTML="Required ..!"
       }
       else{
        document.getElementById('offer-error').innerHTML="Enter a valid offer per"
       }
        e.preventDefault()
     }else{
        document.getElementById('offer-error').innerHTML=""
     }
   
}




   

    function removeoff(ev) {

        ev.preventDefault();
        var urlToRedirect = ev.currentTarget.getAttribute('href'); //use currentTarget because the click may be on the nested i tag and not a tag causing the href to be empty

        swal({
            title: "Are you sure?",
            text: "Are you want to remove the offer",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                // redirect with javascript here as per your logic after showing the alert using the urlToRedirect value
                if (willDelete) {
                    swal("offer removed successfully!", {
                        icon: "success",

                    });
                    location.href = urlToRedirect
                } else {

                    swal("No change in offer amount !");

                }
            });
    }



/******* End ******/



/*************validate Sub category ******/
function removecatoff(e,id,err){
    //e.preventDefault()
    
   const catoff=document.getElementById(id).value
    

    if(catoff==''||!catoff.match(/[0-9]/)){
      
       if(catoff==''){

        document.getElementById(err).innerHTML="Required ..!"
       }
       else{
        document.getElementById(err).innerHTML="Enter a valid offer per"
       }
        e.preventDefault()
     }else{
        document.getElementById(err).innerHTML=""
     }
}
/******* End ******/


/*************validate Sub category ******/
function validaterefamount(e){
    
    
   const reffoff=document.getElementById('validationreferal').value
    

    if(reffoff==''||!reffoff.match(/[0-9]/)){
      
       if(reffoff==''){

        document.getElementById('referror').innerHTML="Required ..!"
       }
       else{
        document.getElementById('referror').innerHTML="Enter a valid refferal amount"
       }
        e.preventDefault()
     }else{
        document.getElementById('referror').innerHTML=""
     }
}
/******* End ******/
