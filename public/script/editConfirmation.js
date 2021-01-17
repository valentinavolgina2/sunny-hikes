
const deleteReviewBtns = document.querySelectorAll('.delete-review-btn');
if (deleteReviewBtns) { 
    Array.from(deleteReviewBtns)
    .forEach(function (deleteReviewBtn) {
        deleteReviewBtn.addEventListener('click', (event) => { 
            if (!confirm('Are you sure you would like to delete this review?')) { 
                event.preventDefault();
            }
    })
});
}

const deleteHikeBtn = document.getElementById("delete-hike-btn");
if (deleteHikeBtn) { 
    deleteHikeBtn.addEventListener('click', (event) => { 
        if (!confirm('Are you sure you would like to delete this hike?')) { 
            event.preventDefault();
        }
    })
}

