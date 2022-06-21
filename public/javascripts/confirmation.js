
    function confirmation(ev) {

        ev.preventDefault();
        var urlToRedirect = ev.currentTarget.getAttribute('href'); //use currentTarget because the click may be on the nested i tag and not a tag causing the href to be empty

        swal({
            title: "Are you sure?",
            text: "Once deleted, you will not be able to recover this  data!",
            icon: "warning",
            buttons: true,
            dangerMode: true,
        })
            .then((willDelete) => {
                // redirect with javascript here as per your logic after showing the alert using the urlToRedirect value
                if (willDelete) {
                    swal("Your  file has been deleted!", {
                        icon: "success",

                    });
                    location.href = urlToRedirect
                } else {

                    swal("Your  file is safe!");

                }
            });
    }