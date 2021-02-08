(function () {
    'use strict'

    const forms = document.querySelectorAll('.needs-validation')
    const newPassword = document.getElementById('newPassword');
    const repeatPassword = document.getElementById('repeatPassword');
    const matchError = document.getElementById('matchError');
    // Loop over them and prevent submission
    Array.from(forms)
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                
                matchError.innerHTML = "";
                form.classList.remove('was-validated');
                repeatPassword.classList.remove('is-invalid');
                repeatPassword.classList.remove('is-valid');
                if (!form.checkValidity()) {
                    event.preventDefault();
                    event.stopPropagation();
                    form.classList.add('was-validated');
                } else if (newPassword.value !== repeatPassword.value) { 
                    event.preventDefault();
                    event.stopPropagation();
                    repeatPassword.classList.add('is-invalid');
                    matchError.innerHTML = "New Password and Repeat Password must be match.";
                }
                
            }, false)
        })
})()