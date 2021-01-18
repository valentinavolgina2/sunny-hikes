const pageList = document.getElementById('pageButtons');
const hikeList = hikes.features;
const PAGE_SIZE = 3;

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

    for (let column = 0; column < 3; column++) { 

        const columnDiv = DomModule.createDiv('col-lg-4','col-md-6','col-hike');


        for (let i = (page - 1) * PAGE_SIZE + column; i < page * PAGE_SIZE && i < hikeList.length; i=i+3) { 

            const card = DomModule.createDiv('card', 'mb-3');
            const img = DomModule.createImage((hikeList[i].images.length) ? hikeList[i].images[0].url : defaultImg, 'A hike photo', 'img-fluid');

            const title = DomModule.createTextElement('H5', hikeList[i].title, 'card-title');
            const description = DomModule.createTextElement('P', hikeList[i].description.substring(0, 200) + "...", 'card-text', 'multiline-text');
            const location = DomModule.createTextElement('P', `<small class="text-muted">${hikeList[i].location}</small>`, 'card-text');

            const detailsBtn = DomModule.createAnchor(`/hikes/${hikeList[i]._id}`, 'Show Details', 'btn', 'btn-primary', 'shadow-none', 'btn-primary-custom');
            const detailsContainer = DomModule.createDiv('d-grid', 'gap-2');
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

const setDistanceFilter = () => { 
    const distanceFilter = document.getElementById('distance-filter');
    for (let option of distanceFilter.options) { 
        if (option.value == distance) { 
            option.selected = true;
        }
    }
}

function onLoad() { 

    setDistanceFilter();
    loadPage(1);
};

onLoad();






