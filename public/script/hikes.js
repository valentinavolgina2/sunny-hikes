const pageList = document.getElementById('pageButtons');
const hikeList = hikes.features;
const PAGE_SIZE = 16;
const columnsNumber = 6;

const extractPageNumber = (url) => { 
    return parseInt(url.slice(url.indexOf('page')+5));
}

const createPageButton = function (text, page, active) { 
    const anchor = DomModule.createAnchor(`?page=${page}`,text, 'page-link','page-link-custom');
    if (active) {
        anchor.classList.add('current-page');
    } 

    anchor.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        loadPage(extractPageNumber(this.href));
    })

    const li = DomModule.createLi('page-item');
    DomModule.appendChildren(li, anchor);
    DomModule.appendChildren(pageList, li);

    return li;
}

const deleteElemets = (parent, childClass) => { 
    const elements = parent.getElementsByClassName(childClass);
    while (elements[0]) {
        elements[0].parentNode.removeChild(elements[0]);
    }
}

const createPageNavigation = (page) => { 

    deleteElemets(pageList, "page-link");

    const previous = createPageButton("Previous", page-1);
    if (page === 1) {
        previous.classList.add('disabled');
    } else {
        createPageButton(page-1, page-1);
        previous.classList.remove('disabled');
    }

    createPageButton(page, page, true);

    if (page * PAGE_SIZE >= hikeList.length) {
        let next = createPageButton("Next", page+1);
        next.classList.add('disabled');
    } else {
        createPageButton(page + 1, page + 1);
        let next = createPageButton("Next", page+1);
        next.classList.remove('disabled');
    }

    
}

const createHikeCards = (page) => { 

    const hikeContainer = document.getElementById('row-hike');
    const defaultImg = 'https://res.cloudinary.com/dlpn4rtaa/image/upload/v1610948282/YelpHike/noImage_h2tqne.png';

    //delete previous page
    deleteElemets(hikeContainer, "col-hike");

    for (let column = 0; column < columnsNumber; column++) { 

        const columnDiv = DomModule.createDiv('col-xl-2','col-md-4','col-6','col-hike','px-1');


        for (let i = (page - 1) * PAGE_SIZE + column; i < page * PAGE_SIZE && i < hikeList.length; i=i+columnsNumber) { 

            const card = DomModule.createDiv('card', 'mb-3');
            const img = DomModule.createImage((hikeList[i].images.length) ? hikeList[i].images[0].url : defaultImg, 'A hike photo', 'img-fluid');

            const title = DomModule.createTextElement('H5', hikeList[i].title, 'card-title');

            const description = DomModule.createTextElement('P', hikeList[i].properties.facility, 'card-text', 'multiline-text');

            // const description = DomModule.createTextElement('P', hikeList[i].description.substring(0, 200) + "...", 'card-text', 'multiline-text');
            const location = DomModule.createTextElement('P', `<small class="text-muted">${hikeList[i].location}</small>`, 'card-text');

            const detailsBtn = DomModule.createAnchor(`/hikes/${hikeList[i]._id}`, 'Show Details', 'btn', 'btn-primary', 'shadow-none', 'btn-primary-custom');
            const detailsContainer = DomModule.createDiv('d-grid');
            DomModule.appendChildren(detailsContainer, detailsBtn);

            const cardBody = DomModule.createDiv('card-body');
            DomModule.appendChildren(cardBody, title, description, location, detailsContainer);
            DomModule.appendChildren(card, img, cardBody);
            DomModule.appendChildren(columnDiv, card);
        }
        
        DomModule.appendChildren(hikeContainer, columnDiv);
    }
}

const loadPage = (page)=>{ 
    
    createHikeCards(page);

    createPageNavigation(page);

}

const formatDate = (date) => {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    return [year, month, day].join('-');
}

const conditionColors = [
    ['None', '#35504F'],
    ['Thunderstorm', '#BC3842'],
    ['Rain','#216C84'],
    ['Drizzle','#91C1C1'],
    ['Snow','#F5F8F5'],
    ['Clouds','#DEB4A9'],
    ['Clear','#DBC85E'],
    ['Mist','#7EBDAB'],
    ['Smoke','#817553'],
    ['Haze','#7EBDAB'],
    ['Dust','#817553'],
    ['Fog','#7EBDAB'],
    ['Sand','#817553'],
    ['Ash','#817553'],
    ['Squall','#BC3842'],
    ['Tornado','#BC3842']
];

const getConditionColor = (condition) => { 
    for (let condColor of conditionColors) { 
        if (condColor[0] === condition) { 
            return condColor[1];
        }
    }
    return '#aaa';
}

const setColor = (conditionCheckbox) => { 
    let span = conditionCheckbox.parentNode.getElementsByTagName('span')[0];
    if (conditionCheckbox.checked === true) {
        span.style.backgroundColor = getConditionColor(conditionCheckbox.value);
        span.classList.add('border');
        span.classList.add('border-dark');
    } else {
        span.style.backgroundColor = "#c0c0c0";
        span.classList.remove('border');
        span.classList.remove('border-dark');
    }
}

const setWeatherConditionColors = () => { 
    
    const conditionCheckboxes = document.querySelectorAll('.colored-checkbox');
    conditionCheckboxes.forEach(conditionCheckbox => {
        setColor(conditionCheckbox);
        conditionCheckbox.addEventListener('change', function (e) {
            setColor(conditionCheckbox);
        })
    });
}

const changeDateUTC = () => { 
    const forecastDay = document.getElementById('date-filter').value.split('-');
    const dateUTC = document.getElementById('dateFilterUTC');

    const d = new Date(forecastDay[0], forecastDay[1]-1, forecastDay[2]);
    dateUTC.value = d.getTime();
}

const setWeatherFilter = () => { 
    const forecastDayFilter = document.getElementById('date-filter');
    const todayFormatted = formatDate(parseInt(forecastDay));
    forecastDayFilter.value = todayFormatted;
    changeDateUTC();

    forecastDayFilter.addEventListener('change',function () { 
        changeDateUTC();
    });

    setWeatherConditionColors();
}

const setDistanceFilter = () => { 
    const distanceFilter = document.getElementById('distance-filter');
    for (let option of distanceFilter.options) { 
        if (option.value == distance) { 
            option.selected = true;
        }
    }
}

function onLoad() { 
    setWeatherFilter();
    setDistanceFilter();
    loadPage(1);
};

onLoad();






