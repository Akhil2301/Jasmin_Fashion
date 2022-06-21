
$("#error-alert").fadeTo(2000, 500).slideUp(500, function(){
    $("#error-alert").slideUp(500);
});

function validation(ev) {

    let fname = document.myform.fname.value;
    let lname = document.myform.lname.value;
    let email = document.myform.email.value;
    let phone = document.myform.phone.value;
    let password = document.myform.password.value;

    

    if (fname == '' || ! fname.match(/[A-Za-z]$/)) {
     if(fname == ''){
        document.getElementById('errorfname').innerHTML = 'First Name Required..!';
     }
     else{
        document.getElementById('errorfname').innerHTML = 'No special characters allowed..!';
     }
       
        ev.preventDefault()
    }
    else{
        document.getElementById('errorfname').innerHTML = ''; 
    }
    if (lname == '' || ! lname.match(/[A-Za-z]$/)) {
        if (lname == ''){
            document.getElementById('errorlname').innerHTML = 'Last name required..!'
        ev.preventDefault()
        }
        else{
            document.getElementById('errorlname').innerHTML = 'No special characters allowed..!';
         }
        
    }
    else{
        document.getElementById('errorlname').innerHTML = ''; 
    }

    if (email == '' || ! email.match(/^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/)) {
        if (email == ''  ){
        document.getElementById('erroremail').innerHTML = 'Email is required..!'

        }  
        else{
            document.getElementById('erroremail').innerHTML = 'Enter Valid email'
        }
        ev.preventDefault()
    }
    else{
        document.getElementById('erroremail').innerHTML = ''; 
    }

    if (phone == '' || ! phone.match(/^\d{10}$/)) {
        if(phone == ''){
            document.getElementById('errorphone').innerHTML = ' Phone Number is Required..!'
        }else{
            document.getElementById('errorphone').innerHTML = 'Enter the valid phone number' 
        }
       
        ev.preventDefault()
    }else{
        document.getElementById('errorphone').innerHTML = ''; 
    }

    if (password == '' || ! password.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/)) {
        if(password == ''){
            document.getElementById('errorpassword').innerHTML = 'Password Reqired..!'
        }
       else{
        document.getElementById('errorpassword').innerHTML = 'At least one number and one uppercase and lowercase letter, and at least 4 or more characters'

       }
        ev.preventDefault()
    }
    else{
        document.getElementById('errorpassword  ').innerHTML = ''; 
    }
   


}






function validate(ev) {

    let fnamedata = document.myforms.fname.value;
    let lnamedata = document.myforms.lname.value;
    // let email = document.myforms.email.value;
    let phonedata = document.myforms.phone.value;
 
    if (fnamedata === '' || ! fnamedata.match(/[A-Za-z]$/)) {
       
        if(fnamedata == ''){
            document.getElementById('errorefname').innerHTML = 'First Name Required..!';
         }
         else{
            document.getElementById('errorefname').innerHTML = 'No special characters allowed..!';
         }
         
            ev.preventDefault()
        
    }else{
        document.getElementById('errorefname').innerHTML = ''; 
    }

    if (lnamedata == '' || ! lnamedata.match(/[A-Za-z]$/)) {

        if(lnamedata == ''){
            document.getElementById('errorelname').innerHTML = 'Last Name Required..!';
         }
         else{
            document.getElementById('errorelname').innerHTML = 'No special characters allowed..!';
         }
         
            ev.preventDefault()
    }
    else{
        document.getElementById('errorelname').innerHTML = ''; 
    }

    if (phonedata == '' || ! phonedata.match(/^\d{10}$/)) {
        if(phonedata == ''){
            document.getElementById('errorephone').innerHTML = ' Phone Number is Required..!'
        }else{
            document.getElementById('errorephone').innerHTML = 'Enter the valid phone number' 
        }
        
        ev.preventDefault()
    }
    else{
        document.getElementById('errorephone').innerHTML = ''; 
    }
    

}

function validateForm(e) {

   
    let oldpassword = document.changepass.password.value;
    let newpassword = document.changepass.npass.value;
    let confirmpassword = document.changepass.cpass.value;
    if(oldpassword=== '' ){
        document.getElementById('erroroldpassword').innerHTML='Enter Old Password'
        e.preventDefault()
    }
   
    if(newpassword==oldpassword){
        document.getElementById('errornewpassword').innerHTML='Enter A New Password'
        e.preventDefault()
    }

    if (newpassword == '' || ! newpassword.match(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/)) {
        if(newpassword == ''){
            document.getElementById('errornewpassword').innerHTML = 'Password Required'
        }
        else{
            document.getElementById('errornewpassword').innerHTML = 'At least one number and one uppercase and lowercase letter, and at least 4 or more characters'
        }
        
        e.preventDefault()
    }

    if(newpassword!=confirmpassword){
        document.getElementById('errorconfirmpassword').innerHTML='Password Does not Match'
        e.preventDefault()
    }
    
}


/*************validate Address ******/
const form = document.getElementById('Address')



    
form.addEventListener('submit', (ev) => {
    const address = document.getElementById('address').value
    const city = document.getElementById('city').value
    const zip = document.getElementById('zip').value

    if (address == '') {
        
        document.getElementById('errorAddress').innerHTML = 'Address Required ..!';
        ev.preventDefault()

    } else {
        document.getElementById('errorAddress').innerHTML = '';
    }

    if (city == '') {
        document.getElementById('errorCity').innerHTML = 'City Required ..!';
        ev.preventDefault()

    } else {
        document.getElementById('errorCity').innerHTML = '';
    }

    if (zip == '') {
        document.getElementById('errorzip').innerHTML = 'zip Required ..!';
        ev.preventDefault()

    } else {
        document.getElementById('errorzip').innerHTML = '';
    }



})
/******* End ******/


