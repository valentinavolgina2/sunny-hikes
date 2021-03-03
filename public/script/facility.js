function createHiddenFacilities() { 

    const facilityInputs = document.querySelectorAll('.facility');
    const form = document.getElementById('hikeForm');
    facilityInputs.forEach(facilityInput => { 
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.id = facilityInput.id+"hidden";
        hiddenField.name = `hike[facilities][${facilityInput.id}]`;
        hiddenField.value = facilityInput.checked;
        DomModule.insertAfter(hiddenField, facilityInput);
    
        facilityInput.addEventListener('change', function (e) { 
            const hiddenInput = document.getElementById(facilityInput.id+"hidden");
            hiddenInput.value = facilityInput.checked;
        });
    });

}

createHiddenFacilities();