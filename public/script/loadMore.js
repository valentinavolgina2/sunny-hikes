const previous = document.getElementById('previousBtn');
const next = document.getElementById('nextBtn');
const pageList = document.getElementById('pageButtons');

const createPageButton = function (page, active) { 
    const anchor = document.createElement('a');
    const li = document.createElement('li');

    li.classList.add('page-item');
    anchor.href = `${path}${page}`;
    anchor.innerHTML = page;
    anchor.classList.add('page-link');
    anchor.classList.add('page-link-custom');
    if (active) {
        anchor.classList.add('current-page');
    } 
    li.appendChild(anchor);
    pageList.insertBefore(li, next);

}

function changePages() {

    if (previousPage === 0) {
        previous.classList.add('disabled');
    } else {
        createPageButton(previousPage);
        previous.classList.remove('disabled');
    }

    createPageButton(previousPage + 1, true);

    if (nextPage === -1) {
        next.classList.add('disabled');
    } else {
        createPageButton(nextPage);
        next.classList.remove('disabled');
    }

}

changePages();




