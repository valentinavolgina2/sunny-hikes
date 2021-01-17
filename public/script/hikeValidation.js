//consider move it to the server

(function () {
    'use strict'

    const form = document.getElementById('hikeForm');
    const imageUpload = document.querySelector('#images');
    const maxImages = 2;
    let extensionIsAllowed = true;

    const currentImages = Array.from(document.querySelectorAll('.delete-image'));
    let remainImages = (currentImages) ? currentImages.length : 0;


    imageUpload.addEventListener('change', function (event) {

        form.classList.remove('was-validated');
        imageUpload.classList.remove('is-invalid');
        imageUpload.classList.remove('is-valid');

        extensionIsAllowed = checkFileExtensions(imageUpload);

        if (!extensionIsAllowed || imageUpload.files.length + remainImages > maxImages) {
            imageUpload.classList.add('is-invalid');
        } else { 
            imageUpload.classList.add('is-valid');
        }
    }, false)

    form.addEventListener('submit', function (event) {

        imageUpload.classList.remove('is-invalid');
        imageUpload.classList.remove('is-valid');
        if (!extensionIsAllowed || imageUpload.files.length + remainImages > maxImages) {
            event.preventDefault()
            event.stopPropagation()
            imageUpload.classList.add('is-invalid');
        } else if (!form.checkValidity()){ 
            event.preventDefault();
            event.stopPropagation();
            form.classList.add('was-validated');
        }

    }, false)

    if (currentImages) { 
        currentImages.forEach(function (currentImage) { 
            currentImage.addEventListener('change', function (e) { 
    
                if (currentImage.checked) {
                    currentImage.labels[0].innerHTML = "Undo";
                    currentImage.parentElement.parentElement.classList.add('img-deleted');
                    remainImages--;
                } else { 
                    currentImage.labels[0].innerHTML = "Delete";
                    currentImage.parentElement.parentElement.classList.remove('img-deleted');
                    remainImages++;
                }
    
                form.classList.remove('was-validated');
                imageUpload.classList.remove('is-invalid');
                imageUpload.classList.remove('is-valid');
                if (!extensionIsAllowed || imageUpload.files.length + remainImages > maxImages) {
                    imageUpload.classList.add('is-invalid');
                } else { 
                    imageUpload.classList.add('is-valid');
                }
            })
        })
    }

})()

function checkFileExtensions(imageUpload) { 
    for (let file of imageUpload.files) { 
        const extension = file.name.match(/\.([^\.]+)$/)[1];
        switch (extension) {
            case 'jpg':
            case 'jpeg':
            case 'png':
                break;
            default:
                return false;
        }

    }
    return true;
}
