let sunrise;
let sunset;

let left;
let bottom;


// _ = helper functions
function _parseMillisecondsIntoReadableTime(timestamp) {
	//Get hours from milliseconds
	const date = new Date(timestamp * 1000);
	// Hours part from the timestamp
	const hours = '0' + date.getHours();
	// Minutes part from the timestamp
	const minutes = '0' + date.getMinutes();
	// Seconds part from the timestamp (gebruiken we nu niet)
	// const seconds = '0' + date.getSeconds();

	// Will display time in 10:30(:23) format
	return hours.substr(-2) + ':' + minutes.substr(-2); //  + ':' + s
}

// 5 TODO: maak updateSun functie

const updateSun = function(aantalMinutenZonOp, totalMinutes){
	// aantalMinutenZonOp = 550;
	// totalMinutes = 600;
	left = (aantalMinutenZonOp / totalMinutes) * 100;
	console.info(`${left}%`);
	if(totalMinutes / 2 > aantalMinutenZonOp){
		bottom = (aantalMinutenZonOp / (totalMinutes / 2)) * 100;
	}
	else{
		aantalMinutenZonOp = aantalMinutenZonOp - (totalMinutes / 2);
		totalMinutes = totalMinutes - (totalMinutes / 2)
		bottom = 100-((aantalMinutenZonOp / totalMinutes) * 100);
	}
	console.info(`Procent left: ${left}%`)
	console.info(`Procent bottom: ${bottom}%`);

	const resterendeMinuten = totalMinutes - aantalMinutenZonOp;

	const uren = Math.floor(resterendeMinuten / 60);
	const minuten = resterendeMinuten % 60;
	console.info(uren);
	console.info(minuten);
	if(uren < 1){
		document.querySelector('.js-time-left').innerHTML = `${minuten}`;
	}
	else{
		document.querySelector('.js-time-left').innerHTML = `${uren} hour(s), ${Math.round(minuten)}`;
	}
	const sun = document.querySelector('.js-sun');
	sun.style.cssText = `bottom: ${bottom}%; left: ${left}%;`
	sun.setAttribute("data-time", _parseMillisecondsIntoReadableTime(Date.now() / 1000));
}

// 4 Zet de zon op de juiste plaats en zorg ervoor dat dit iedere minuut gebeurt.
let placeSunAndStartMoving = (totalMinutes, sunrise) => {
	// In de functie moeten we eerst wat zaken ophalen en berekenen.
	// Haal het DOM element van onze zon op en van onze aantal minuten resterend deze dag.
	// Bepaal het aantal minuten dat de zon al op is.
	const huidigeTijd = Date.now() / 1000;
	console.info(`Huidige tijd: ${huidigeTijd}`);
	console.info(`Sunrise: ${sunrise}`);
	console.info(`Totale aantal minuten dat zon op is: ${totalMinutes}`)
	const aantalMinutenZonOp = (huidigeTijd - sunrise) / 60;
	console.info(`Aantal minuten zon op: ${aantalMinutenZonOp}`);
	const aantalMinutenResterend = totalMinutes - aantalMinutenZonOp;
	console.info(`Aantal minuten resterend: ${aantalMinutenResterend}`);
	// Nu zetten we de zon op de initiële goede positie ( met de functie updateSun ). Bereken hiervoor hoeveel procent er van de totale zon-tijd al voorbij is.
	updateSun(aantalMinutenZonOp, totalMinutes);
	let intervalID = setInterval(() => {
		const tijd = Date.now() / 1000;
		const minutenZonOp = (tijd - sunrise) / 60;
		updateSun(minutenZonOp, totalMinutes);
		if(minutenZonOp > totalMinutes){
			document.querySelector('.js-time-left').innerHTML = '0';
			document.getElementsByTagName('html')[0].classList.add('is-night');
			clearInterval(intervalID);
		}
	}, 60 * 1000);
	// setInterval(function(){updateSun(aantalMinutenZonOp, totalMinutes)}, 60 * 1000);
	// We voegen ook de 'is-loaded' class toe aan de body-tag.
	// Vergeet niet om het resterende aantal minuten in te vullen.
	// Nu maken we een functie die de zon elke minuut zal updaten
	// Bekijk of de zon niet nog onder of reeds onder is
	// Anders kunnen we huidige waarden evalueren en de zon updaten via de updateSun functie.
	// PS.: vergeet weer niet om het resterend aantal minuten te updaten en verhoog het aantal verstreken minuten.
};

// 3 Met de data van de API kunnen we de app opvullen
let showResult = queryResponse => {
	// We gaan eerst een paar onderdelen opvullen
	// Zorg dat de juiste locatie weergegeven wordt, volgens wat je uit de API terug krijgt.
	document.querySelector('.js-location').innerHTML = `${queryResponse.city.name} Belgium`

	// Toon ook de juiste tijd voor de opkomst van de zon en de zonsondergang.
	const sunriseSeconds = queryResponse.city.sunrise;
	const sunsetSeconds = queryResponse.city.sunset;
	sunrise = _parseMillisecondsIntoReadableTime(sunriseSeconds);
	sunset = _parseMillisecondsIntoReadableTime(sunsetSeconds);
	console.info(sunrise);
	console.info(sunset);
	document.querySelector('.js-sunrise').innerHTML = sunrise;
	document.querySelector('.js-sunset').innerHTML = sunset;

	// Hier gaan we een functie oproepen die de zon een bepaalde positie kan geven en dit kan updaten.
	// Geef deze functie de periode tussen sunrise en sunset mee en het tijdstip van sunrise.
	const seconds = sunsetSeconds - sunriseSeconds;
	const totalMinutes = seconds / 60;
	console.info(totalMinutes);



	placeSunAndStartMoving(totalMinutes, sunriseSeconds);

	// sunrise = new Date(queryResponse.city.sunrise * 1000 - queryResponse.city.timezone);
	// sunset = new Date(queryResponse.city.sunset * 1000 - queryResponse.city.timezone);

};

// 2 Aan de hand van een longitude en latitude gaan we de yahoo wheater API ophalen.
let getAPI = async (lat, lon) => {
	// Eerst bouwen we onze url op
	// Met de fetch API proberen we de data op te halen.
	// Als dat gelukt is, gaan we naar onze showResult functie.
	const weatherInfo = await fetch(
		`http://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=nl&cnt=1`
	).then((response) => response.json());
	console.log(weatherInfo);
	showResult(weatherInfo);
};

document.addEventListener('DOMContentLoaded', function() {
	// 1 We will query the API with longitude and latitude.
	getAPI(50.8027841, 3.2097454);
});
