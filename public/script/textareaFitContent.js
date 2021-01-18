function onload() {
    const textarea = document.querySelector('.textarea-fit');
    if (textarea) { 
        textarea.style.height = "";
        textarea.style.height = textarea.scrollHeight + "px";
        textarea.addEventListener('input', function (event) {
            this.style.height = "";
            this.style.height = this.scrollHeight + "px";
        })
    }
}

onload();