//consider move it to the server

(function () {
    'use strict'

    const form = document.getElementById('hikeForm');
    const imageUpload = document.querySelector('#images');
    const locationSearch = document.querySelector('.mapboxgl-ctrl-geocoder--input');
    const locationInput = ( locationSearch == null) ? document.getElementById('location') : locationSearch;
    const maxImages = 5;
    let isValidFileExtension = true;
    const MAX_FILE_SIZE = 3 * 1024 * 1024// 3MB;
    let isValidFileSize = true;

    const closeSpans = Array.from(document.querySelectorAll('.close'));
    let remainImages = (closeSpans) ? closeSpans.length : 0;

    imageUpload.addEventListener('change', function (event) {

        form.classList.remove('was-validated');
        imageUpload.classList.remove('is-invalid');
        imageUpload.classList.remove('is-valid');

        isValidFileExtension = checkFileExtensions(imageUpload);

        let files = Array.from(imageUpload.files).map(x => x.size);
        const largeFiles = files.filter(f=>f>MAX_FILE_SIZE);
        
        isValidFileSize = (largeFiles.length == 0);
        const isValidFilesNUmber = imageUpload.files.length + remainImages <= maxImages;
        if (isValidFileExtension && isValidFileSize && isValidFilesNUmber) {
            imageUpload.classList.add('is-valid');
        } else { 
            imageUpload.classList.add('is-invalid');
        }
    }, false)

    form.addEventListener('submit', function (event) {

        const isValidLocation = inWA(locationInput.value);
        locationInput.classList.remove('is-invalid');
        locationInput.classList.remove('is-valid');
        if (!isValidLocation) {
            console.log('not valid');
            locationInput.classList.add('is-invalid');
        } 

        imageUpload.classList.remove('is-invalid');
        imageUpload.classList.remove('is-valid');
        const isValidFilesNUmber = imageUpload.files.length + remainImages <= maxImages;
        const isValidImages = (isValidFileExtension && isValidFileSize && isValidFilesNUmber);
        if (!isValidImages) { 
            imageUpload.classList.add('is-invalid');
        }

        if (isValidLocation && isValidImages) {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
                form.classList.add('was-validated');
            }
        } else { 
            event.preventDefault();
            event.stopPropagation();
        }


    }, false)

    if (closeSpans) { 
        closeSpans.forEach(function (closeSpan) { 
            closeSpan.addEventListener('click', function (e) { 
    
                const currentImage = closeSpan.parentElement.children[2];
                currentImage.checked = !currentImage.checked;

                if (currentImage.checked) {
                    currentImage.parentElement.classList.add('img-deleted');
                    remainImages--;
                } else { 
                    currentImage.parentElement.classList.remove('img-deleted');
                    remainImages++;
                }
    
                form.classList.remove('was-validated');
                imageUpload.classList.remove('is-invalid');
                imageUpload.classList.remove('is-valid');
                const isValidFilesNUmber = imageUpload.files.length + remainImages <= maxImages;
                if (isValidFileExtension && isValidFileSize && isValidFilesNUmber) {
                    imageUpload.classList.add('is-valid');
                } else { 
                    imageUpload.classList.add('is-invalid');
                }
            })
        })
    }

})()

function validateImages() { 

}

function inWA(location) { 
    return (location.includes('Washington') || location.includes('WA'));
}

function validateLocation(locationInput) { 
    return inWA(locationInput.value);
}

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



