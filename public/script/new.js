const onLoad = () => { 
    const facilities = document.querySelectorAll('.facility');
    facilities.forEach(checkbox => { 
        checkbox.addEventListener('change', function (e) { 
            checkbox.value = (checkbox.checked) ? true : false;
        })
    });

}

onLoad();