const onLoad = () => { 
    const facilities = document.querySelectorAll('.form-check-input');
    facilities.forEach(checkbox => { 
        checkbox.addEventListener('change', function (e) { 
            checkbox.value = (checkbox.checked) ? true : false;
        })
    });
}

onLoad();