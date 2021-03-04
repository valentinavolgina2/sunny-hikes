const weatherSection = document.getElementById('weatherSection');

if (hike.weather.length > 0) {
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const container = DomModule.createDiv('row');
    for (let weather of hike.weather) {
        const card = DomModule.createDiv('col-lg-3', 'col-md-4', 'col-6', 'border');
        const dayContainer = DomModule.createDiv('row', 'text-center', 'mt-2');

        let dayText = '';
        if (new Date(weather.day).toDateString() == (new Date().toDateString())) {
            dayText = 'Today';
        } else if (new Date(weather.day).toDateString() == (tomorrow.toDateString())) {
            dayText = 'Tomorrow';
        } else {
            dayText = new Date(weather.day).toDateString().split(' ')[0];
        }
        DomModule.appendChildren(dayContainer, DomModule.createTextElement('P', dayText));

        const iconContainer = DomModule.createDiv('row', 'text-center');
        const iconCol = DomModule.createDiv('col-12');
        const img = DomModule.createImage(`/images/weather/${weather.icon}.png`, 'Weather icon');
        DomModule.appendChildren(iconCol, img);
        DomModule.appendChildren(iconContainer, iconCol);

        const temperatureContainer = DomModule.createDiv('row', 'text-center');
        const temperatureText = DomModule.createTextElement('P', `${weather.temperature.min}&deg;F / ${weather.temperature.max}&deg;F`);
        DomModule.appendChildren(temperatureContainer, temperatureText);

        const descriptionContainer = DomModule.createDiv('row', 'text-center');
        const descriptionText = DomModule.createTextElement('P', weather.description);
        DomModule.appendChildren(descriptionContainer, descriptionText);

        DomModule.appendChildren(card, dayContainer);
        DomModule.appendChildren(card, iconContainer);
        DomModule.appendChildren(card, temperatureContainer);
        DomModule.appendChildren(card, descriptionContainer);

        DomModule.appendChildren(container, card);
    }
    DomModule.appendChildren(weatherSection, container);
} else { 
    const noWeather = DomModule.createTextElement('P', 'There is no weather forecast yet.');
    DomModule.appendChildren(weatherSection, noWeather);
}