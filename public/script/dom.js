class DomModule { 
    static createDiv (...classes) { 
        const div = document.createElement('DIV');
        classes.forEach(className => div.classList.add(className));
        return div;
    }
    
    static createLi (...classes){ 
        const li = document.createElement('LI');
        classes.forEach(className => li.classList.add(className));
        return li;
    }

    static createImage (src,alt, ...classes){ 
        const img = document.createElement('IMG');
        classes.forEach(className => img.classList.add(className));
        img.src = src;
        img.alt = alt;
        return img;
    }

    static createTextElement (element,text, ...classes){ 
        const textElm = document.createElement(element);
        classes.forEach(className => textElm.classList.add(className));
        textElm.innerHTML = text;
        return textElm;
    }

    static createAnchor (href,text, ...classes) { 
        const a = document.createElement('A');
        classes.forEach(className => a.classList.add(className));
        a.href = href;
        a.innerHTML = text;
        return a;
    }

    static appendChildren (parent, ...children){ 
        children.forEach(child=>parent.appendChild(child));
    }

    static insertAfter(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    }
}










