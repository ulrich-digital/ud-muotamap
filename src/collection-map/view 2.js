const geolocation_nur_simulieren = false; // Umschalten zwischen Simulation und echter Geolocation
const route_nachfuehren = true;

import apiFetch from '@wordpress/api-fetch';

import L from "leaflet";
let currentCoordinates = [47.0207, 8.6523]; // Beispielkoordinaten als Fallback
let previousCoordinates = [...currentCoordinates]; // Speichert die vorherige Position

const bounds = [[46.591, 7.917], [47.434, 9.219]];
const styleURL = 'https://api.mapbox.com/styles/v1/ulrichdigital/cm42iduyt00x101r20fa19tlr/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1IjoidWxyaWNoZGlnaXRhbCIsImEiOiJjbTQyaTk1ZjMwMHc1MmpxdzNwb2gzcnJ5In0.dNCkyJW5SkOCLz0_hGLMxA';
const globus = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img"><path d="M55.7 199.7L96 240l48 0 48 48 0 64 32 32 0 64 64 0 0-48 64-64 0-80-128 0-32-32 0-32 80 0 0-32-32-32 0-16 32-32 0-31.4c-5.3-.4-10.6-.6-16-.6C160.6 48 80.3 112.2 55.7 199.7zM464 256c0-36.9-9.6-71.5-26.4-101.6L400 192l0 80 63.4 0c.4-5.3 .6-10.6 .6-16zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>`;
const markerSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 48" class="custom-marker"> <path class="custom-marker-svg" d="M19 48s16.3-17.7 16.3-27.2c0-9-7.4-16.3-16.5-16.2-8.9 0-16.2 7.3-16.2 16.2C2.6 30.3 18.9 48 18.9 48Zm0-32.7c3 0 5.4 2.4 5.4 5.4S22 26.1 19 26.1c-3 0-5.4-2.4-5.4-5.4 0-3 2.4-5.4 5.4-5.4Z"/></svg>`;
const CustomIcon = L.divIcon({
	html: markerSVG,
	className: 'custom-icon-wrapper',
	iconSize: [38, 48],
	iconAnchor: [19, 48],
	popupAnchor: [0, -48],
});

const AmpelmannBewegtSVG = `<svg class="ampelmann_bewegt_svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 50 50">
  <path id="beinhinten" d="M12.4,43.8c-.2-.5-.5-1.2-.7-1.7-.1-.2,0-.5.2-.7.7-.6,4.2-3.4,4.2-3.4,0,0,5.9-5.1,7.4-6.3s1.2-.9,1.6-1.4c1.8-1.9,1.8-5,0-6.9s-4.4-1.9-6.3-.5c-.2.1-.4.3-.6.5h0s-.1.2-.2.3c-.3.4-.6.8-.8,1.2-1.1,1.7-2.5,3.4-6.8,8-4.7,4.9-5.6,5.9-5.8,6.4-.2.4-.2.8,0,1.1.6,1.3,6.3,6.6,7.9,7.4.7.4,1,0,.9-.8,0,0-.4-1.8-1-3.2Z"/>
  <path id="beinvorne" d="M42.3,39c-.5.2-1.2.5-1.7.7-.2,0-.5,0-.7-.2-.6-.7-3.4-4.2-3.4-4.2,0,0-5.1-5.9-6.3-7.4s-.9-1.2-1.4-1.6c-1.9-1.8-5-1.8-6.9,0s-1.9,4.4-.5,6.3c.1.2.3.4.5.6h0s.2,0,.3.2c.4.3.8.6,1.2.8,1.7,1.1,3.4,2.5,8,6.8,4.9,4.7,5.9,5.6,6.4,5.8.4.2.8.2,1.1,0,1.3-.6,6.6-6.3,7.4-7.9.4-.7,0-1-.8-.9,0,0-1.8.4-3.2,1Z"/>
  <path id="oberkorper" d="M30.3,4.4c2.3-1.6,3.7-2.8,3.5-3-.4-.6-1.9-.8-4.8.6-2-1.8-5.2-1.9-7.8-.2,0,0,0,0,0,0-.1-.2-.4-.2-.7,0-.3.2-.4.5-.3.7,0,0,0,0,0,0-2.4,2.1-3.3,5.2-2.3,7.6-.6.8-.7,1.2-.4,1.6.2.4.6.4,1.4,0,.2.2.5.4.7.5-.4.2-.7.2-1.2.2.3.4,1.1.6,1.8.6-.3.2-.9.5-1.2.3.6.4,1.2.3,1.9,0,0,.4-.4.6-.7.8.6,0,1.2-.2,1.7-.5,0,0,0,0,0,0,0,.2-.6,1-1.4,2.4-.3-.2-.6-.3-.9-.3-2.4-.4-5.1,3.3-5.5,5.8-.5,2.6.6,5.1,2.5,6.4.7,4.6,6,5.7,9.7,4.3,4.2-1.5,6-5.9,5-10.9-.4-1.9-1.9-3.8-2.9-5.4.2-.8,1-1,1.3-1.1,1.3-.5,3-1.5,2.9-3,0-1.5-.4-2.8-.4-2.8,0,0,1.5-1.1,1.4-1.4-.1-.4-2.6-1.3-3.3-3.2Z"/>
</svg>`;


document.addEventListener("DOMContentLoaded", () => {
    const mapContainers = document.querySelectorAll(".wp-block-muotamap-collection-map");
    mapContainers.forEach((mapElement) => {

        // Prüfen, ob wir im Backend (Blockeditor) sind
        const isBackend = document.body.classList.contains("is-admin") || mapElement.closest(".editor-styles-wrapper");

        // Wenn wir im Backend sind
        if (isBackend) {

		} else {
			// Wenn wir im Frontend sind

			let markers = [];

			// Sammelkarte initialisieren
			function initializeCollectiveMap(mapElement) {

				async function fetchMarkersFromAllPages() {
					try {
						const response = await fetch('/wp-json/custom/v1/all-pages-markers'); // REST-API-Endpunkt für alle Seiten/Posts
						if (!response.ok) {
							throw new Error(`HTTP error! Status: ${response.status}`);
						}
						markers = await response.json();

						const markerGroup = []; // Speichere Marker-Koordinaten für Bound-Berechnung
						// Karte initialisieren
						const map = L.map(mapElement);
						mapElement._mapInstance = map; // `mapInstance` jetzt im Element verfügbar

						L.tileLayer(styleURL, {
							attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
							tileSize: 512, // Tile-Größe (512px für Retina-Unterstützung)
							zoomOffset: -1, // Anpassung für hochauflösende Tiles
							detectRetina: true, // Automatische Umschaltung auf Retina-Tiles
						}).addTo(map);

						for (const markerData of markers) {
							const { latitude, longitude } = markerData;

							// Erstelle Marker mit benutzerdefiniertem Icon und füge ihn der Karte hinzu
							const marker = L.marker([latitude, longitude], { icon: CustomIcon }).addTo(map);
							markerGroup.push([latitude, longitude]); // Speichere die Position des Markers

							// Popup klonen
							map.on("popupopen", (e) => {
								const popupContainer = e.popup._container; // Popup-Container
								const mapContainer = map.getContainer(); // Karten-Container dynamisch abrufen

								// Verschieben des Popups in den Karten-Container
								if (mapContainer && popupContainer) {
									// Vorhandene `cloned-leaflet-popup`-Elemente entfernen
									const existingClonedPopups = mapContainer.querySelectorAll('.cloned-leaflet-popup');
									existingClonedPopups.forEach((popup) => popup.remove()); // Entfernt alle alten geklonten Popups

									// Neues Popup klonen
									const clonedPopup = popupContainer.cloneNode(true); // Popup-Element klonen

									// Styles und Klassen bereinigen
									clonedPopup.removeAttribute('style'); // Entfernt das gesamte `style`-Attribut
									clonedPopup.classList.remove('leaflet-popup');
									clonedPopup.classList.remove('leaflet-zoom-animated');
									clonedPopup.classList.add('cloned-leaflet-popup');
									// Entferne inline-Styles aus allen verschachtelten Elementen
									const elementsWithStyle = clonedPopup.querySelectorAll('[style]');
									elementsWithStyle.forEach(element => {
										element.removeAttribute('style');
									});
									// Geklontes Popup in den Karten-Container einfügen
									mapContainer.appendChild(clonedPopup);
								}
							}); // map.on("popupopen"), (e) => {


							/* =============================================================== *\
							Event: Marker wird geklickt
							\* =============================================================== */
							marker.on('click', function (event) {
								marker_wurde_geklickt(mapElement, marker);
								popups_schliessen(mapElement);
								ampelmann_marker_entfernen(mapElement._mapInstance);
								route_entfernen(mapElement._mapInstance);
								erzeugePopupContent(markerData).then((popupContent) => {
									marker.bindPopup(popupContent, { closeOnMove: false, autoClose: false, closeOnClick: false });
									marker.openPopup();

								}).catch((err) => {
									console.error("Fehler beim Generieren des Popup-Inhalts:", err);
								});

							});

						} // END: durch alle Marker iterieren for (const markerData of markers) {

						/* =============================================================== *\
						Events: Klick
						- Ampelmann-Button
						- Single-Marker-Button
						\* =============================================================== */
						mapElement.addEventListener('click', (e) => {
							const ampelmannButton = e.target.closest('.button.route');
							if (ampelmannButton) {
								route_anzeigen(mapElement._mapInstance, ampelmannButton);
								ampelmann_anzeigen(mapElement._mapInstance);
							}

							const singleMarkerButton = e.target.closest('.button.single_marker');
							if (singleMarkerButton) {

								ampelmann_marker_entfernen(mapElement._mapInstance);
								route_entfernen(mapElement._mapInstance);
								karte_auf_aktiven_marker_zentrieren(mapElement);
							}
						});


						/* =============================================================== *\
							CustomControl erweitern
							- Karte zentrieren
						\* =============================================================== */

						// Benutzerdefinierte Leaflet-Control-Klasse erstellen
						const CustomControl = L.Control.extend({
							options: {
								position: 'topleft' // Position: topleft, topright, bottomleft, bottomright
							},

							onAdd: function (map) {
								// Erstelle ein div-Element für den Button
								const container = L.DomUtil.create('div', 'leaflet-bar custom-control leaflet-control-map_reset_container');

								// Füge eine Klasse und einen Button hinzu
								const button = L.DomUtil.create('a', 'custom-control-button leaflet_control-map_reset', container);
								//button.href = '#';
								button.title = 'Karte zentrieren';
								button.innerHTML = globus; // Symbol oder Text für den Button

								// Hole das zugehörige mapElement
								const mapElement = map.getContainer();
								mapElement._mapInstance = map; // `mapInstance` jetzt im Element verfügbar

								/* =============================================================== *\
								Event: Klick auf Karte zentrieren
								\* =============================================================== */
								L.DomEvent.on(button, 'click', function (e) {
									L.DomEvent.stopPropagation(e); // Verhindert das Durchreichen des Klicks
									L.DomEvent.preventDefault(e); // Verhindert Standardverhalten
									karte_zentrieren(map, markerGroup);
									route_entfernen(map);
									ampelmann_marker_entfernen(map);
									alle_aktiven_marker_entfernen(mapElement);
									popups_schliessen(mapElement);
								});
								return container;
							}
						});

						map.addControl(new CustomControl());


						/* =============================================================== *\
						Karte zentrieren
						\* =============================================================== */
						karte_zentrieren(map,markerGroup);


						/* =============================================================== *\
						Event: Klick auf Map
						- Popups schliessen
						- aktive Marker entfernen
						\* =============================================================== */
						map.on('click', function (event) {});

					} catch (error) {
						console.error('Fehler beim Abrufen der Marker:', error);
					}
				} // async function fetchMarkersFromAllPages() {


				fetchMarkersFromAllPages();
			} // function initializeCollectiveMap(mapElement) {



			// Aufruf der Funktion, wenn die Sammelkarte geladen wird
			const collectiveMapElement = document.querySelector('.wp-block-muotamap-collection-map'); // Selektor für die Sammelkarte
			if (collectiveMapElement) {
				initializeCollectiveMap(collectiveMapElement);
			} //     if (collectiveMapElement) {


		}   // END: if frontend


		/* =============================================================== *\
		   Frontend and Backend
		\* =============================================================== */



	}); // mapContainers.forEach((mapElement) => {
}); // document.addEventListener("DOMContentLoaded", () => {

/* =============================================================== *\
   Karte zentrieren
\* =============================================================== */
function karte_zentrieren(map, markerGroup){
	if (markerGroup.length > 0) {
		const bounds = L.latLngBounds(markerGroup); // Berechne die Bounds aller Marker
		const padding = window.innerWidth < 800 ? [20, 20] : [100, 100];
		map.fitBounds(bounds, {
			padding: padding, // Verwende dynamisches Padding
		});
//console.log("Calling fitBounds with bounds:", bounds);

	}else {
        // Fallback: Standardposition und Zoom verwenden
        const defaultPosition = [47.0064174, 8.6322735];
        const defaultZoom = 13; // Standardzoom
        map.setView(defaultPosition, defaultZoom);
    }
}


/* =============================================================== *\
	Funktion Erzeuge PopupContent
\* =============================================================== */
async function erzeugePopupContent(markerData) {
console.log(markerData);
	const { latitude, longitude, title, text, image, linkedContent, permalinkProjekt, pageTitle } = markerData;

	let contentClasses = "content_above_image";
	if (linkedContent) contentClasses += " has-linked-content"; // Klasse für verlinkten Inhalt
	if (image) contentClasses += " has-image"; // Klasse, wenn ein Bild vorhanden ist

	// Grundstruktur des Popups
	let popupContent = `<div class="popup_buttons">
		<button class="button route" data-lat="${latitude}" data-lng="${longitude}">${AmpelmannBewegtSVG}</button>
		<button class="button single_marker active" data-lat="${latitude}" data-lng="${longitude}">${markerSVG}</button>
	</div>`;


	popupContent += `<div class="card">`;
	popupContent += `<div class="${contentClasses}">`;

	// Füge verlinkte Inhalte hinzu
	var permalink = "";
	if (linkedContent) {
		const [type, id] = linkedContent.split('-');

		const { link, date } = await fetchPostData(type, id); // Hole Permalink und Datum
		/*if (date) {
			popupContent += `<p class="post-date">${date}</p>`;
		}*/
		permalink = link;
	}

	// verlinktes Projekt
	popupContent += `<p class="projekt_link"><a href="${permalinkProjekt}"><i class="fa-sharp fa-regular fa-arrow-down-right arrow_before_text"></i>${pageTitle}</a></p>`;

	// Titel und Text
	popupContent += `<h3>${title}</h3>`;
	popupContent += `<p>${text}</p>`;
	popupContent += `</div>`; // .content_above_image schließen

	// Bild hinzufügen, falls vorhanden
	if (image) {
		popupContent += `<div class="image_container">`;
		popupContent += `<figure><img src="${image}" alt="${title}" style="max-width: 100%; height: auto;" /></figure>`;
		popupContent += `<svg class="post_overlay" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 409.584 111.466" preserveAspectRatio="none"><path d="M0,0V111.466C169.415,95.866,219.838-22.334,409.584,18.487V0Z"></path></svg>`;
		popupContent += `</div>`;
	}

	// "Mehr"-Button hinzufügen, falls Link vorhanden ist
	if (linkedContent && permalink!="") {
		popupContent += `<div class="wave_button"><a class="post_link" href="${permalink}"><i class="fa-sharp fa-regular fa-arrow-down-right arrow_before_text"></i>Mehr</a><svg class="overlay_bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293.702 77.466" preserveAspectRatio="none"><path class="button_wave" d="M0,77.4c38.3-2.6,73.7-6.1,129.2-35C169.1,21.7,198.4,0,249.4,0c14.9,0,29.7,1.5,44.3,4.8v72.7H0Z"></path></svg></div>`;
	}

	popupContent += `</div>`; // .card schließen

	return popupContent;

}

/* =============================================================== *\
	Funktion Marker wurde geklickt
\* =============================================================== */
function marker_wurde_geklickt(mapElement, marker) {
	mapElement.classList.add('has_active_marker');

	// Entferne die Klasse 'active' von allen '.custom-marker'-Elementen
	mapElement.querySelectorAll('.custom-marker').forEach((el) => {
    	el.classList.remove('active');
	});

	// Aktivieren/Deaktivieren des aktuellen Markers
	const icon = marker.getElement().querySelector('.custom-marker');
	if (icon) {
		const isActive = icon.classList.toggle('active');
		mapElement._activeMarker = isActive ? marker : null;
		if (isActive) {
			marker.openPopup();
			entferne_alle_verschachtelten_styles(mapElement);
		}
	}
}

/* =============================================================== *\
   Funktion: inline-Styles bei Cloned-Leaflet-Popup entfernen
\* =============================================================== */
function entferne_alle_verschachtelten_styles(mapElement) {
    // Suche alle Elemente mit der Klasse .cloned-leaflet-popup
    const clonedPopups = mapElement.querySelectorAll('.cloned-leaflet-popup');

    clonedPopups.forEach(popup => {
        // Entferne alle inline styles aus den verschachtelten Elementen
        const elementsWithStyle = popup.querySelectorAll('[style]');
        elementsWithStyle.forEach(element => {
            element.removeAttribute('style');
        });
    });
}

/* =============================================================== *\
	Funktion: Setzt alle aktiven Marker zurück
\* =============================================================== */
function alle_aktiven_marker_entfernen(mapElement) {
	const aktiveMarker = mapElement.querySelectorAll('.leaflet-marker-icon .active'); // Alle aktiven Marker finden
	aktiveMarker.forEach(marker => {
		marker.classList.remove('active'); // Entferne die "active"-Klasse
	});
}


/* =============================================================== *\
	Funktion: Schliesst alle offene popups
\* =============================================================== */
function popups_schliessen(mapElement) {
	const popups = mapElement.querySelectorAll('.cloned-leaflet-popup'); // Alle Popups in dieser Karte finden
	popups.forEach(popup => {
		popup.remove(); // Entferne jedes Popup aus dem DOM
	});
}


/* =============================================================== *\
	Funktion: Route anzeigen
\* =============================================================== */
function route_anzeigen(mapElement, ampelmannButton) {
	const mapContainer = mapElement.getContainer(); // Karten-Container dynamisch abrufen

	// Klassen Handling
	mapContainer.classList.add('has_active_route');
    mapContainer.querySelectorAll('.button.single_marker').forEach((el) => {
        el.classList.remove('active');
    });
	ampelmannButton.classList.add('active');


	// Zielkoordinaten aus den Datenattributen des Buttons auslesen
	const targetLat = parseFloat(ampelmannButton.dataset.lat);
	const targetLng = parseFloat(ampelmannButton.dataset.lng);

	// Zeichne die neue Route
	const routingControl = L.Routing.control({
		waypoints: [
			L.latLng(currentCoordinates), // Startpunkt
			L.latLng(targetLat, targetLng) // Zielpunkt
		],

		addWaypoints: false, // Keine neuen Wegpunkte hinzufügen
		fitSelectedRoutes: true, // Passe den Kartenausschnitt an
		showAlternatives: false, // Keine Alternativrouten anzeigen
		routeWhileDragging: false, // Route während Dragging neu berechnen
		routeDragInterval: 200, // Neuberechnung alle 200 ms
		serviceUrl: 'http://router.project-osrm.org/route/v1',
		lineOptions: {
			styles: [
				{ color: '#964226', weight: 8, opacity: 0.8 } // Stil der Route
			],
			addWaypoints: false // Wegpunkte auf der Linie deaktivieren
		},
		createMarker: function (i, waypoint, n) {
			// Deaktiviere Marker
			return null;
		}
	});
	mapElement._routeControl = routingControl.addTo(mapElement);
}


/* =============================================================== *\
	Funktion: Route entfernen
\* =============================================================== */
function route_entfernen(mapElement) {
	const mapContainer = mapElement.getContainer(); // Karten-Container dynamisch abrufen

	// Klassen-Handling
	mapContainer.classList.remove('has_active_route');
    mapContainer.querySelectorAll('.button.route').forEach((el) => {
        el.classList.remove('active');
    });
    mapContainer.querySelectorAll('.button.single_marker').forEach((el) => {
        el.classList.add('active');
    });

	if (mapElement && mapElement instanceof L.Map) {
		if (mapElement._routeControl) {
			mapElement._routeControl.remove(); // Entferne die Route von der Karte
			mapElement._routeControl = null; // Setze die Referenz zurück
		}
		//console.warn('mapElement ist  gültige Leaflet-Karte:', mapElement);
	} else {
		//console.warn('mapElement ist keine gültige Leaflet-Karte:', mapElement);
	}
}

/* =============================================================== *\
   Title
\* =============================================================== */
function karte_auf_aktiven_marker_zentrieren(mapElement) {
    const map = mapElement._mapInstance;
    if (!map) {
        return;
    }
	let activeMarker = null;

    map.eachLayer(function (layer) {
        // Prüfe, ob der Layer ein Marker ist und ein DOM-Element besitzt
        if (layer instanceof L.Marker && layer.getElement) {
            const markerElement = layer.getElement();
            const activeSVG = markerElement.querySelector('svg.active');

            if (activeSVG) {
                activeMarker = layer;
            }
        }
    });

    // Wenn der aktive Marker gefunden wurde, Karte zentrieren
    if (activeMarker) {
        const latLng = activeMarker.getLatLng();
        map.setView(latLng, map.getZoom());
    }
}



/* =============================================================== *\
	Funktion: Ampelmann-Marker hinzufügen
\* =============================================================== */
function ampelmann_anzeigen(container) {
	const ampelmannIcon = L.divIcon({
		html: AmpelmannBewegtSVG,
		className: 'imhere-icon-wrapper init',
		iconSize: [50, 50],
		iconAnchor: [25, 50],
		popupAnchor: [0, -50],
	});

	container._ampelmannMarker = L.marker(currentCoordinates, { icon: ampelmannIcon }).addTo(container);
	const markerElement = container._ampelmannMarker.getElement();

	if (markerElement) {
		markerElement.classList.remove('init');
	}

	// Geolocation
	initialisiereGeolocation(container);
}

/* =============================================================== *\
	Funktion: Ampelmann-Marker entfernen
\* =============================================================== */
function ampelmann_marker_entfernen(mapElement) {
	// Prüfen, ob der Ampelmann-Marker existiert
	if (mapElement._ampelmannMarker) {
		mapElement._ampelmannMarker.remove(); // Entferne den Marker von der Karte
		mapElement._ampelmannMarker = null; // Referenz zurücksetzen
		stoppeSimulation(mapElement); // Simulation stoppen
	}
}

/* =============================================================== *\
   Hole Post-Datum und Permalink
\* =============================================================== */
const fetchPostData = async (type, id) => {
    try {
        const post = await apiFetch({ path: `/wp/v2/${type}/${id}` });
        const { date, link } = post; // Extrahiere Datum und Permalink
        const formattedDate = formatDate(date);
        return { date: formattedDate, link };
    } catch (error) {
        console.error("Fehler beim Abrufen des Posts:", error);
        return null;
    }
};

/* =============================================================== *\
   Formatiere Datum
\* =============================================================== */
const formatDate = (dateString) => {
    const date = new Date(dateString); // String in ein Date-Objekt umwandeln
    return new Intl.DateTimeFormat('de-DE', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    }).format(date);
};


/* =============================================================== *\
   Funktion: Initialisiert die Geolocation-Überwachung oder Simulation
   - Ruft die aktuelle Position über die Geolocation-API ab.
   - Bei deaktivierter Geolocation wird eine Bewegung simuliert.
   - Aktualisiert den Ampelmann-Marker mit den neuen Koordinaten.
\* =============================================================== */
function initialisiereGeolocation(mapElement) {
	// Echte Geolocation
    if (!geolocation_nur_simulieren && navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                currentCoordinates = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];
                //console.log("Geolocation erfolgreich:", currentCoordinates);
                aktualisiereAmpelmannMarker(mapElement);
				aktualisiereBounds(mapElement._mapInstance, bounds, currentCoordinates);
            },
            (error) => {
                //console.error("Fehler beim Abrufen der Geolocation:", error);
            },
            {
                enableHighAccuracy: true, // Höchste Genauigkeit
                maximumAge: 1000, // Max. Alter der Position in ms
                timeout: 2000, // Timeout in ms
            }
        );
    } else {
        console.warn("Geolocation wird simuliert.");
        simuliereBewegung(mapElement); // Bewegung simulieren
    }
}

function simuliereBewegung(mapElement) {
    // Prüfen, ob ein Intervall bereits läuft
    if (mapElement._simulationInterval) {
        //console.log("Simulierte Bewegung läuft bereits.");
        return; // Kein neues Intervall starten
    }

    // Neues Intervall starten
    mapElement._simulationInterval = setInterval(() => {
        // Verschiebe die Koordinaten um einen kleinen Betrag
        currentCoordinates[0] += (Math.random() - 0.5) * 0.01; // Breitengrad manipulieren
        currentCoordinates[1] += (Math.random() - 0.5) * 0.01; // Längengrad manipulieren
        //console.log('Simulierte Koordinaten:', currentCoordinates);
        aktualisiereAmpelmannMarker(mapElement);
		aktualisiereBounds(mapElement, bounds, currentCoordinates);
    }, 2000); // Alle 2 Sekunden
}

/* =============================================================== *\
   Funktion: Ampelmann-Marker aktualisieren und Richtung bestimmen
\* =============================================================== */
function aktualisiereAmpelmannMarker(mapElement) {
	if(mapElement._ampelmannMarker){
		if (currentCoordinates[1] < previousCoordinates[1]) {
			mapElement._ampelmannMarker.getElement().classList.add("nase_links");
		} else {
			mapElement._ampelmannMarker.getElement().classList.remove("nase_links");
		}

		// Marker aktualisieren
		mapElement._ampelmannMarker.setLatLng(currentCoordinates);
		// Route aktualisieren, falls aktiv
		if(route_nachfuehren == true){
			if (mapElement._routeControl) {
				mapElement._routeControl.setWaypoints([
					L.latLng(currentCoordinates), // Aktueller Standort
					mapElement._routeControl.getWaypoints()[1].latLng, // Ziel beibehalten
				]);
			}
		}

		// Aktualisiere die vorherigen Koordinaten
		previousCoordinates = [...currentCoordinates];
	}
}

/* =============================================================== *\
   Funktion: Aktualisiere die Begrenzung der Karte
   - Überprüft, ob die aktuellen Koordinaten außerhalb der aktuellen bounds liegen.
   - Falls ja, erweitert sie die bounds entsprechend.
\* =============================================================== */
function aktualisiereBounds(map, bounds, currentCoordinates) {
    const [lat, lng] = currentCoordinates;

    // Prüfen, ob die Koordinaten außerhalb der bestehenden bounds liegen
    const sw = bounds[0]; // Südwestliche Ecke
    const ne = bounds[1]; // Nordöstliche Ecke

    let boundsErweitert = false;

    if (lat < sw[0]) {
        sw[0] = lat; // Erweiterung nach Süden
        boundsErweitert = true;
    }
    if (lng < sw[1]) {
        sw[1] = lng; // Erweiterung nach Westen
        boundsErweitert = true;
    }
    if (lat > ne[0]) {
        ne[0] = lat; // Erweiterung nach Norden
        boundsErweitert = true;
    }
    if (lng > ne[1]) {
        ne[1] = lng; // Erweiterung nach Osten
        boundsErweitert = true;
    }

    // Aktualisiere die Karte, falls bounds geändert wurden
    if (boundsErweitert) {
        map.setMaxBounds(bounds); // Setze die neuen bounds
        map.fitBounds(bounds); // Passe den Kartenausschnitt an
    }
}

/* =============================================================== *\
   Funktion: Simulierte Bewegung stoppen
\* =============================================================== */
function stoppeSimulation(mapElement) {
    if (mapElement._simulationInterval) {
        clearInterval(mapElement._simulationInterval);
        mapElement._simulationInterval = null; // Zurücksetzen
    }
}