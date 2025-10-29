import apiFetch from '@wordpress/api-fetch';
import { registerBlockType } from '@wordpress/blocks';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useBlockProps, InspectorControls, MediaUpload, MediaUploadCheck } from '@wordpress/block-editor';
import { PanelBody, Button, Modal, TextControl, TextareaControl, SelectControl } from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';

const styleURL = 'https://api.mapbox.com/styles/v1/ulrichdigital/cm42iduyt00x101r20fa19tlr/tiles/512/{z}/{x}/{y}?access_token=pk.eyJ1IjoidWxyaWNoZGlnaXRhbCIsImEiOiJjbTQyaTk1ZjMwMHc1MmpxdzNwb2gzcnJ5In0.dNCkyJW5SkOCLz0_hGLMxA';

const postTypesToFetch = ["posts"];
const markerSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 48" class="custom-marker"> <path class="custom-marker-svg" d="M19 48s16.3-17.7 16.3-27.2c0-9-7.4-16.3-16.5-16.2-8.9 0-16.2 7.3-16.2 16.2C2.6 30.3 18.9 48 18.9 48Zm0-32.7c3 0 5.4 2.4 5.4 5.4S22 26.1 19 26.1c-3 0-5.4-2.4-5.4-5.4 0-3 2.4-5.4 5.4-5.4Z"/></svg>`;

const globus = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" preserveAspectRatio="xMidYMid meet" aria-hidden="true" role="img"><path d="M55.7 199.7L96 240l48 0 48 48 0 64 32 32 0 64 64 0 0-48 64-64 0-80-128 0-32-32 0-32 80 0 0-32-32-32 0-16 32-32 0-31.4c-5.3-.4-10.6-.6-16-.6C160.6 48 80.3 112.2 55.7 199.7zM464 256c0-36.9-9.6-71.5-26.4-101.6L400 192l0 80 63.4 0c.4-5.3 .6-10.6 .6-16zM0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256z"/></svg>`;

const AmpelmannBewegtSVG = `<svg class="ampelmann_bewegt_svg" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 50 50">
  <path id="beinhinten" d="M12.4,43.8c-.2-.5-.5-1.2-.7-1.7-.1-.2,0-.5.2-.7.7-.6,4.2-3.4,4.2-3.4,0,0,5.9-5.1,7.4-6.3s1.2-.9,1.6-1.4c1.8-1.9,1.8-5,0-6.9s-4.4-1.9-6.3-.5c-.2.1-.4.3-.6.5h0s-.1.2-.2.3c-.3.4-.6.8-.8,1.2-1.1,1.7-2.5,3.4-6.8,8-4.7,4.9-5.6,5.9-5.8,6.4-.2.4-.2.8,0,1.1.6,1.3,6.3,6.6,7.9,7.4.7.4,1,0,.9-.8,0,0-.4-1.8-1-3.2Z"/>
  <path id="beinvorne" d="M42.3,39c-.5.2-1.2.5-1.7.7-.2,0-.5,0-.7-.2-.6-.7-3.4-4.2-3.4-4.2,0,0-5.1-5.9-6.3-7.4s-.9-1.2-1.4-1.6c-1.9-1.8-5-1.8-6.9,0s-1.9,4.4-.5,6.3c.1.2.3.4.5.6h0s.2,0,.3.2c.4.3.8.6,1.2.8,1.7,1.1,3.4,2.5,8,6.8,4.9,4.7,5.9,5.6,6.4,5.8.4.2.8.2,1.1,0,1.3-.6,6.6-6.3,7.4-7.9.4-.7,0-1-.8-.9,0,0-1.8.4-3.2,1Z"/>
  <path id="oberkorper" d="M30.3,4.4c2.3-1.6,3.7-2.8,3.5-3-.4-.6-1.9-.8-4.8.6-2-1.8-5.2-1.9-7.8-.2,0,0,0,0,0,0-.1-.2-.4-.2-.7,0-.3.2-.4.5-.3.7,0,0,0,0,0,0-2.4,2.1-3.3,5.2-2.3,7.6-.6.8-.7,1.2-.4,1.6.2.4.6.4,1.4,0,.2.2.5.4.7.5-.4.2-.7.2-1.2.2.3.4,1.1.6,1.8.6-.3.2-.9.5-1.2.3.6.4,1.2.3,1.9,0,0,.4-.4.6-.7.8.6,0,1.2-.2,1.7-.5,0,0,0,0,0,0,0,.2-.6,1-1.4,2.4-.3-.2-.6-.3-.9-.3-2.4-.4-5.1,3.3-5.5,5.8-.5,2.6.6,5.1,2.5,6.4.7,4.6,6,5.7,9.7,4.3,4.2-1.5,6-5.9,5-10.9-.4-1.9-1.9-3.8-2.9-5.4.2-.8,1-1,1.3-1.1,1.3-.5,3-1.5,2.9-3,0-1.5-.4-2.8-.4-2.8,0,0,1.5-1.1,1.4-1.4-.1-.4-2.6-1.3-3.3-3.2Z"/>
</svg>`;

const defaultLat = 47.0064174;
const defaultLng = 8.6322735;
const defaultZoom = 13;


// Block Definition
registerBlockType('muotamap/single-map', {
	title: 'Single Map',
	icon: 'location-alt',
	category: 'muotamaps',
	description: 'Dieser Block stellt eine Karte mit Markern dar. Diese können mit Magazinbeiträgen verlinkt und mit Text und Bilder ergänzt werden. Sie sind mit einer Geotargeting-Funktion ausgestattet.',
	attributes: {
		latitude: { type: 'number', default: 47.0064174},
		longitude: { type: 'number', default: 8.6322735 },
		zoom: { type: 'number', default: 13 },
		markers: { type: 'array', default: [] },
	},

 	example: {
        attributes: {
            latitude: 47.0064174,
            longitude: 8.6322735,
            zoom: 15,
            markers: [
               {
                latitude: 47.009715,
                longitude: 8.617963
            },
            {
              latitude: 47.011441, // Marker für Ibach (bei der Muotabrücke)
                longitude: 8.643498
            }
            ]
        }
    },

	edit: ({ attributes, setAttributes, clientId }) => {
		const { latitude, longitude, zoom, markers = [] } = attributes; // Fallback für markers
		const mapContainerRef = useRef(null);
		const mapRef = useRef(null);
		const [isModalOpen, setIsModalOpen] = useState(false);
		const [editingMarkerIndex, setEditingMarkerIndex] = useState(null);
		const modalMapRef = useRef(null); // Referenz zur Leaflet-Karteninstanz im Modal
		const modalMapContainerRef = useRef(null); // Referenz zum HTML-Container für die Modal-Karte
		const modalMarkerRef = useRef(null); // Referenz zum Marker in der Modalansicht
		const [options, setOptions] = useState([{ label: 'None', value: '' }]); // Kombinierte Optionen für Projekte, Beiträge und Seiten
		const mapMarkersRef = useRef([]);
		const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
		const [markerToDeleteIndex, setMarkerToDeleteIndex] = useState(null);
		const [bounds, setBounds] = useState(null);
		const [isMapReady, setIsMapReady] = useState(false);
    	const { selectBlock } = useDispatch('core/block-editor');
const draggingOnRef = useRef(false);

    	const isSelected = useSelect((select) => select('core/block-editor').isBlockSelected(clientId), [clientId]);
 		// Block-Props mit zusätzlicher Klasse, wenn ausgewählt
    	const blockProps = useBlockProps({
        	className: isSelected ? 'wp-block-muotamap is-selected' : 'wp-block-muotamap',
    	});


		/* =============================================================== *\
		   Funktionen
		\* =============================================================== */

		/* Modal für Editing öffnen */
		const openEditModal = (index) => {
			// Prüfe, ob der Index gültig ist
			if (index === null || index < 0 || index >= attributes.markers.length) {
				console.warn("Ungültiger Marker-Index:", index);
				return;
			}
			// Setze den Bearbeitungsindex und öffne das Modal
			setEditingMarkerIndex(index);
			setIsModalOpen(true);
		};


		/* =============================================================== *\
		   Event: Klick auf Marker
		\* =============================================================== */
		function handleMarkerClick(marker) {
			// Prüfen, ob das Event bereits hinzugefügt wurde
			if (marker._hasClickEvent) return;

			marker.on('click', (event) => {
				const domTarget = event.originalEvent?.target; // Zugriff auf das geklickte DOM-Element
				const mapContainer = mapRef.current.getContainer();
				alle_aktiven_marker_entfernen(mapContainer);

				// Prüfen, ob das geklickte Element oder ein Eltern-Element die Klasse '.custom-marker' hat
				const clickedCustomMarkerSVG = domTarget.closest('.custom-marker');
				if (clickedCustomMarkerSVG) {
					clickedCustomMarkerSVG.classList.add('active');
				}
			});

			// Setze die Flagge, um zu markieren, dass das Event hinzugefügt wurde
			marker._hasClickEvent = true;
		}


		/* =============================================================== *\
   		   Alle aktiven Marker zurücksetzen
		\* =============================================================== */
		function alle_aktiven_marker_entfernen(mapContainer){
			mapContainer.querySelectorAll('.custom-marker').forEach((markerElement) => {
				markerElement.classList.remove('active');
			});
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
   		   Popups schliessen
		\* =============================================================== */
		function popup_schliessen(mapContainer){
			mapContainer.querySelectorAll('.cloned-leaflet-popup').forEach((popupElement) => {
				popupElement.remove();
			});
		}

		/* =============================================================== *\
   		   Dragging
		\* =============================================================== */
		function resetDraggable(map) {
/*
			const draggable = map.dragging._draggable; // Hole das Draggable-Objekt
			if (draggable) {
				draggable.disable(); // Deaktivieren
				draggable.enable(); // Neu aktivieren
			}
*/
		}


		/* =============================================================== *\
		   Modal für Editing schließen
		   - Aktualisiert die Marker-Daten mit den Änderungen aus dem Modal.
		   - Öffnet das Popup des bearbeiteten Markers auf der Hauptkarte, um die aktualisierten Inhalte anzuzeigen.
		   - Schließt das Modal und setzt den Bearbeitungsstatus zurück.
		\* =============================================================== */
		const closeModal = () => {
			if (editingMarkerIndex !== null) {
				const updatedMarkers = [...markers];
				setAttributes({ markers: updatedMarkers });

				// Popup auf der Hauptkarte aktualisieren
				const mainMapMarker = mapMarkersRef.current[editingMarkerIndex];
				if (mainMapMarker) {
					const popup = mainMapMarker.getPopup();
					if (popup) {
						// Öffne das Popup, um den aktualisierten Inhalt anzuzeigen
						//mainMapMarker.openPopup();
						var my_lat_lng = mainMapMarker._latlng;
						var e = "dummy";
						handlePopupOpen(mapRef.current, e, my_lat_lng);
					}
				}
			}
			setIsModalOpen(false);
			setEditingMarkerIndex(null);
		};


		/* =============================================================== *\
   		   Modal: Delete-Marker schliessen
		\* =============================================================== */
		const closeDeleteModal = () => {
			setIsDeleteModalOpen(false);
		};


		/* =============================================================== *\
		   Funktion zum Löschen des Markers
		\* =============================================================== */
		const confirmDeleteMarker = () => {
			if (markerToDeleteIndex !== null) {

				const updatedMarkers = [...markers];
				updatedMarkers.splice(markerToDeleteIndex, 1); // Marker aus Zustand entfernen
				setAttributes({ markers: updatedMarkers }); // Änderungen speichern

				const markerToRemove = mapMarkersRef.current[markerToDeleteIndex];
				if (markerToRemove) {
					mapRef.current.removeLayer(markerToRemove); // Entferne Marker aus der Karte
					mapMarkersRef.current.splice(markerToDeleteIndex, 1); // Entferne Referenz
				}

				const popupElement = mapRef.current.getContainer().querySelector('.cloned-leaflet-popup');
				if (popupElement) {
					popupElement.remove();
				}

				wp.data.dispatch('core/editor').savePost().then(() => {
					window.location.reload(); // Seite neu laden
				}).catch((error) => {
					console.error("Fehler beim Speichern:", error);
				});

				setIsDeleteModalOpen(false); // Modal schließen
				setMarkerToDeleteIndex(null); // Index zurücksetzen
			}
		};

		/* =============================================================== *\
		   Verarbeitet das Öffnen eines Popups auf der Hauptkarte.
		   - Befüllt den Popup-Inhalt dynamisch mit marker-spezifischen Daten.
		   - Ruft Details zu verlinkten Inhalten (z. B. Beitragslinks und Veröffentlichungsdaten) über die WordPress-API ab.
		   - Stellt Bearbeiten- und Löschen-Buttons für den Marker bereit.
		  - Verschiebt das Popup in den Karten-Container und entfernt Leaflet-Transformationen für ein konsistentes Styling.
		\* =============================================================== */
		const handlePopupOpen = async (map, e, my_lat_lng) => {
			let popup = null;
			let popupContainer = null;
			// Prüfe, ob ein Event vorhanden ist und ein Popup liefert
			if (e && e.popup) {
				popup = e.popup;
				popupContainer = popup._container;
			} else {
				if (map && typeof map.getCenter === 'function') {
					map.openPopup("<p>dummy</p>", my_lat_lng);
				}
				// Wenn kein Event vorhanden ist, prüfe das aktive Popup der Map
				popup = map._popup;
				if (popup) {
					popupContainer = popup._container;
				}
			}

			// Karten-Container dynamisch abrufen
			const mapContainer = map.getContainer();
			// Finde den Marker im Array basierend auf den Koordinaten
			const markerIndex = markers.findIndex(
				(marker) =>
					marker.latitude === popup._latlng.lat &&
					marker.longitude === popup._latlng.lng
			);
			if (markerIndex !== -1) {
				// Extrahiere relevante Daten des Markers
				const { latitude, longitude, title, text, image, linkedContent } = markers[markerIndex];

				// Basis-Klassen für das Popup-Inhaltslayout
				let contentClasses = "content_above_image";
				if (linkedContent) contentClasses += " has-linked-content"; // Zusätzliche Klasse, falls verlinkter Inhalt vorhanden ist
				if (image) contentClasses += " has-image"; // Zusätzliche Klasse, falls ein Bild vorhanden ist

				// Variablen für dynamisch generierte Inhalte
				var permalink = ""; // Frontend-Link des verlinkten Beitrags
				var postDate = ""; // Veröffentlichungsdatum des verlinkten Beitrags
				var editorPermalink = ""; // Admin-Link zur Editor-Ansicht des verlinkten Beitrags

				const baseUrl = window.location.origin; // Basis-URL der aktuellen Seite abrufen (für Admin-Links)

				// Funktion zum Abrufen von Post-Daten aus der WordPress-API
				const fetchPostData = async (type, id) => {
					try {
						const post = await apiFetch({ path: `/wp/v2/${type}/${id}` }); // API-Aufruf
						const { date, link } = post; // Extrahiere Datum und Permalink aus der API-Antwort

						// Datum formatieren (z. B. 10. Dezember 2024)
						const formattedDate = formatDate(date);
						return { date: formattedDate, link }; // Rückgabe des formatierten Datums und des Links
					} catch (error) {
						console.error("Fehler beim Abrufen des Posts:", error); // Fehlerbehandlung
						return null; // Rückgabe null bei Fehler
					}
				};

				// Funktion zur Formatierung von Datumsangaben (z. B. in deutschem Format)
				const formatDate = (dateString) => {
					const date = new Date(dateString); // Konvertiere String zu Date-Objekt
					return new Intl.DateTimeFormat('de-DE', {
						day: 'numeric',
						month: 'long',
						year: 'numeric',
					}).format(date); // Formatierte Datumsangabe zurückgeben
				};

				// Verlinkten Inhalt verarbeiten (falls vorhanden)
				if (linkedContent) {
					const [type, id] = linkedContent.split('-'); // Extrahiere Post-Typ und ID aus der `linkedContent`-Angabe

					try {
						const { link, date } = await fetchPostData(type, id); // Hole Daten des verlinkten Beitrags
						permalink = link; // Frontend-Link speichern
						postDate = date; // Veröffentlichungsdatum speichern
						editorPermalink = `${baseUrl}/wp-admin/post.php?post=${id}&action=edit`; // Admin-Link zur Editor-Ansicht generieren
					} catch (error) {
						console.error("Fehler beim Abrufen des Permalinks:", error); // Fehlerbehandlung
					}
				}

				// Popup-Inhalt dynamisch erstellen
				let popupContent = `<div class="popup_buttons">`;
				popupContent += `<div class="button edit"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M454.6 45.3l12.1 12.1c12.5 12.5 12.5 32.8 0 45.3L440 129.4 382.6 72l26.7-26.7c12.5-12.5 32.8-12.5 45.3 0zM189 265.6l171-171L417.4 152l-171 171c-4.2 4.2-9.6 7.2-15.4 8.6l-65.6 15.1L180.5 281c1.3-5.8 4.3-11.2 8.6-15.4zm197.7-243L166.4 243c-8.5 8.5-14.4 19.2-17.1 30.9l-20.9 90.6c-1.2 5.4 .4 11 4.3 14.9s9.5 5.5 14.9 4.3l90.6-20.9c11.7-2.7 22.4-8.6 30.9-17.1L489.4 125.3c25-25 25-65.5 0-90.5L477.3 22.6c-25-25-65.5-25-90.5 0zM80 64C35.8 64 0 99.8 0 144L0 432c0 44.2 35.8 80 80 80l288 0c44.2 0 80-35.8 80-80l0-128c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 128c0 26.5-21.5 48-48 48L80 480c-26.5 0-48-21.5-48-48l0-288c0-26.5 21.5-48 48-48l128 0c8.8 0 16-7.2 16-16s-7.2-16-16-16L80 64z"/></svg></div>`;
				popupContent += `<div class="button delete"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M164.2 39.5L148.9 64l150.3 0L283.8 39.5c-2.9-4.7-8.1-7.5-13.6-7.5l-92.5 0c-5.5 0-10.6 2.8-13.6 7.5zM311 22.6L336.9 64 384 64l32 0 16 0c8.8 0 16 7.2 16 16s-7.2 16-16 16l-16 0 0 336c0 44.2-35.8 80-80 80l-224 0c-44.2 0-80-35.8-80-80L32 96 16 96C7.2 96 0 88.8 0 80s7.2-16 16-16l16 0 32 0 47.1 0L137 22.6C145.8 8.5 161.2 0 177.7 0l92.5 0c16.6 0 31.9 8.5 40.7 22.6zM64 96l0 336c0 26.5 21.5 48 48 48l224 0c26.5 0 48-21.5 48-48l0-336L64 96zm80 80l0 224c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-224c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0l0 224c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-224c0-8.8 7.2-16 16-16s16 7.2 16 16zm96 0l0 224c0 8.8-7.2 16-16 16s-16-7.2-16-16l0-224c0-8.8 7.2-16 16-16s16 7.2 16 16z"/></svg></div>`;

				popupContent += `<div class="button route" data-lat="${latitude}" data-lng="${longitude}">${AmpelmannBewegtSVG}</div>`;
				popupContent += `</div>`;
				popupContent += `<div class="card">`;
				popupContent += `<div class="${contentClasses}">`;

				// Füge verlinkte Inhalte hinzu
				if (linkedContent) {
					popupContent += `<div class=first_row>`;
					popupContent += `<p class="post-date">${postDate}</p>`;
					popupContent += `<div class="edit_post"><a href="${editorPermalink}" target="_blank" class="post-link"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false"><path d="M19.5 4.5h-7V6h4.44l-5.97 5.97 1.06 1.06L18 7.06v4.44h1.5v-7Zm-13 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3H17v3a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h3V5.5h-3Z"></path></svg></a></div>`;
					popupContent += `</div>`;
				}

				// Titel und Text
				popupContent += `<h3>${title || "Kein Titel"}</h3>`;
				popupContent += `<p>${text || "Kein Text verfügbar"}</p>`;
				popupContent += `</div>`; // .content_above_image schließen

				// Bild hinzufügen, falls vorhanden
				if (image) {
					popupContent += `<div class="image_container">`;
					popupContent += `<figure><img src="${image}" alt="${title || "Marker-Bild"}" style="max-width: 100%; height: auto;" /></figure>`;
					popupContent += `<svg class="post_overlay" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 409.584 111.466" preserveAspectRatio="none"><path d="M0,0V111.466C169.415,95.866,219.838-22.334,409.584,18.487V0Z"></path></svg>`;
					popupContent += `</div>`;
				}

				// "Mehr"-Button hinzufügen, falls Link vorhanden ist
				if (linkedContent) {
					popupContent += `<div class="wave_button">
						<a class="post_link" href="${permalink}" target="_blank" rel="noopener noreferrer"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M328 416l24 0 0-24 0-240 0-24-48 0 0 24 0 182.1L81 111l-17-17L30.1 128l17 17 223 223L88 368l-24 0 0 48 24 0 240 0z"/></svg>Mehr</a>
						<svg class="overlay_bottom" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 293.702 77.466" preserveAspectRatio="none"><path class="button_wave" d="M0,77.4c38.3-2.6,73.7-6.1,129.2-35C169.1,21.7,198.4,0,249.4,0c14.9,0,29.7,1.5,44.3,4.8v72.7H0Z"></path></svg>
					</div>`;
				}

				popupContent += `</div>`; // .card schließen

				// Inhalt ins Popup einfügen
				popup.setContent(popupContent);
			} //if (markerIndex !== -1) {


			// Klonen des Popups in den Karten-Container
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

				// Geklontes Popup in den Karten-Container einfügen
				mapContainer.appendChild(clonedPopup); // Kloniertes Popup in den Karten-Container einfügen
				entferne_alle_verschachtelten_styles(mapContainer);

			}
		} // END: const handlePopupOpen = async (map, e) => {


const [customIcon, setCustomIcon] = useState(null);

useEffect(() => {
	if (typeof L !== 'undefined') {
		const icon = L.divIcon({
			html: markerSVG,
			className: 'custom-icon-wrapper',
			iconSize: [38, 48],
			iconAnchor: [19, 48],
			popupAnchor: [0, -48],
		});
		setCustomIcon(icon);
	}
}, []);




		/* =============================================================== *\
		   Verlinkten Post-Type Holen
		\* =============================================================== */
		useEffect(() => {
			const fetchOptions = async () => {
				try {
					const allOptions = [];

					for (const postType of postTypesToFetch) {
						const posts = await apiFetch({ path: `/wp/v2/${postType}?per_page=100` });
						const postTypeOptions = posts.map((post) => ({
							label: `${post.title.rendered}`,
							value: `${postType}-${post.id}`,
						}));
						allOptions.push(...postTypeOptions);
					}

					setOptions([{ label: 'None', value: '' }, ...allOptions]);
				} catch (error) {
					//console.error('Fehler beim Laden der Post-Types:', error);
				}
			};

			fetchOptions();
		}, []);


		/* =============================================================== *\
		   Initialize map
		\* =============================================================== */
		useEffect(() => {
			if (!mapRef.current && mapContainerRef.current && customIcon) {
				const bounds = L.latLngBounds(); // ✅ Bounds initialisieren

				mapRef.current = L.map(mapContainerRef.current, {
					center: [latitude, longitude],
					zoom: zoom,
					dragging: false,
					inertia: true,
				});

				L.tileLayer(styleURL, {
					attribution: '&copy; <a href="https://www.mapbox.com/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					tileSize: 512,
					zoomOffset: -1,
					detectRetina: true,
					maxZoom: 19,
				}).addTo(mapRef.current);

				L.Marker.prototype.options.icon = customIcon;

				markers.forEach(({ latitude, longitude, title }, index) => {
					const marker = L.marker([latitude, longitude]).addTo(mapRef.current);
					mapMarkersRef.current[index] = marker;
					bounds.extend([latitude, longitude]); // ✅ funktioniert jetzt
					handleMarkerClick(marker);

					if (title) {
						marker.bindPopup(title);
					}
				});

				if (markers.length > 0) {
					mapRef.current.fitBounds(bounds, { padding: [50, 50] });
				}
			}
			setIsMapReady(true);

		}, [latitude, longitude, zoom, markers, customIcon]);





		/* =============================================================== *\
		   Popup-Handler
		   - Bindet den `popupopen`-Handler an die Hauptkarte, um dynamische Inhalte für Marker-Popups zu generieren.
		   - Entfernt den Event-Handler beim Verlassen oder Aktualisieren, um Speicherlecks zu vermeiden.
		   - Reagiert auf Änderungen der Marker-Daten um aktualisierte Inhalte anzuzeigen.
		\* =============================================================== */
		useEffect(() => {
			if (!isMapReady || !mapRef.current) return;

			const handler = (e) => handlePopupOpen(mapRef.current, e);
			mapRef.current.on("popupopen", handler);

			return () => {
				mapRef.current.off("popupopen", handler);
			};
		}, [isMapReady, markers]);



		/* =============================================================== *\
		   Modal-Karte
		   - Initialisierung
		   - Aktualisierung
		   - Synchronisierung der Marker-Positionen zwischen Hauptkarte und Modal.
		\* =============================================================== */
		useEffect(() => {
			if (isModalOpen && editingMarkerIndex !== null && markers[editingMarkerIndex]) {
				const { latitude, longitude } = markers[editingMarkerIndex];
				if (!modalMapRef.current) {
					modalMapRef.current = L.map(modalMapContainerRef.current).setView([latitude, longitude], 13);

					L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
						attribution: '&copy; OpenStreetMap contributors',
						maxZoom: 19,
					}).addTo(modalMapRef.current);

					modalMarkerRef.current = L.marker([latitude, longitude], {
						icon: customIcon,
						draggable: true,
					})
						.addTo(modalMapRef.current)
						.on('dragend', (e) => {
							const { lat, lng } = e.target.getLatLng();
							const updatedMarkers = [...markers];
							updatedMarkers[editingMarkerIndex] = {
								...updatedMarkers[editingMarkerIndex],
								latitude: lat,
								longitude: lng,
							};
							setAttributes({ markers: updatedMarkers });



							// Hauptkarte aktualisieren
    						if (mapRef.current) {
								// Aktualisiere den Marker in der Hauptkarte
								const mainMapMarker = mapMarkersRef.current[editingMarkerIndex];
								if (mainMapMarker) {
									mainMapMarker.setLatLng([lat, lng]);

									// Klassen-Handling
									const markerElement = mainMapMarker.getElement();
									if (markerElement) {
										// Alle anderen Marker von 'active' befreien
										const mapContainer = mapRef.current.getContainer();
										alle_aktiven_marker_entfernen(mapContainer);

										// Klasse 'active' zum aktualisierten Marker hinzufügen
										const customMarker = markerElement.querySelector('.custom-marker');
										if (customMarker) {
											customMarker.classList.add('active');
										}
									}

									const bounds = L.latLngBounds();
									updatedMarkers.forEach(({ latitude, longitude }) => {
										bounds.extend([latitude, longitude]); // Alle Marker berücksichtigen
									});
									mapRef.current.setView([lat, lng]);
									mapRef.current.fitBounds(bounds, { padding: [50, 50] }); // Optional: Padding
								}
							}
						}); // on dragend

				} else {  // if (!modalMapRef.current) {
					// Aktualisiere bestehende Karte
					modalMapRef.current.setView([latitude, longitude]);
					modalMarkerRef.current.setLatLng([latitude, longitude]);
				}
			}

			return () => {
				if (!isModalOpen && modalMapRef.current) {
					modalMapRef.current.remove();
					modalMapRef.current = null;
					modalMarkerRef.current = null;
				}
			};

		}, [isModalOpen, editingMarkerIndex, markers]);


		/* =============================================================== *\
		   Marker-Verwaltung auf der Hauptkarte
   		   - Fügt die Schaltfläche "Marker hinzufügen" abhängig vom Modal-Status hinzu.
   		   - Fügt neue Marker zur Hauptkarte hinzu und speichert deren Referenzen.
   		   - Initialisiert Marker auf der Hauptkarte beim Laden.
		\* =============================================================== */
		const addMarkerControlRef = useRef(null);

useEffect(() => {
  // Warten bis Map + Icon da sind
  if (!isMapReady || !mapRef.current || !customIcon) return;

  // Beim offenen Modal: Control entfernen und hier abbrechen
  if (isModalOpen) {
    if (addMarkerControlRef.current) {
      mapRef.current.removeControl(addMarkerControlRef.current);
      addMarkerControlRef.current = null;
    }
    return;
  }

  // Control existiert schon? Nichts tun
  if (addMarkerControlRef.current) return;

  // Neu anlegen
  const AddMarkerControl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: function (map) {
      const container = L.DomUtil.create(
        'div',
        'custom-control leaflet-control-add-marker'
      );

      const button = L.DomUtil.create(
        'a',
        'custom-control-button',
        container
      );
      button.href = '#';
      button.title = 'Marker hinzufügen';
      button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM168 280l0-64-64 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l64 0 0-64c0-13.3 10.7-24 24-24s24 10.7 24 24l0 64 64 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-64 0 0 64c0 13.3-10.7 24-24 24s-24-10.7-24-24z"/></svg>
        Marker hinzufügen`;

      // Klick sauber behandeln (keine Map-Events auslösen)
      L.DomEvent.on(button, 'click', (e) => {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);

        const mapCenter = map.getCenter();
        const newMarker = {
          title: `Marker ${markers.length + 1}`,
          latitude: mapCenter.lat,
          longitude: mapCenter.lng,
          text: '',
          image: '',
          linkedContent: '',
        };

        const updatedMarkers = [...markers, newMarker];
        setAttributes({ markers: updatedMarkers });

        const newMapMarker = L.marker(
          [newMarker.latitude, newMarker.longitude],
          { icon: customIcon }
        )
          .addTo(mapRef.current)
          .bindPopup(newMarker.title || `Marker ${updatedMarkers.length}`);

        mapMarkersRef.current.push(newMapMarker);

        setEditingMarkerIndex(updatedMarkers.length - 1);
        setIsModalOpen(true);
      });

      // Sicherheitshalber: keine Drag-/Click-Propagation
      L.DomEvent.disableClickPropagation(container);
      L.DomEvent.disableScrollPropagation(container);

      return container;
    },
  });

  const ctrl = new AddMarkerControl();
  mapRef.current.addControl(ctrl);
  addMarkerControlRef.current = ctrl;

  return () => {
    if (mapRef.current && addMarkerControlRef.current) {
      mapRef.current.removeControl(addMarkerControlRef.current);
      addMarkerControlRef.current = null;
    }
  };
}, [isMapReady, customIcon, isModalOpen, markers]);



		/* =============================================================== *\
		   Erstellt ein benutzerdefinierte Leaflet-Control Globus oben rechts
			- die beim Klicken die Karte auf die Bounds aller Marker zentriert
			- und sich bei Änderungen der Marker aktualisiert.
		\* =============================================================== */

		const mapResetControlRef = useRef(null);

		useEffect(() => {
			if (mapRef.current) {
				// Entferne die Control, falls sie bereits existiert
				if (mapResetControlRef.current) {
					mapRef.current.removeControl(mapResetControlRef.current);
					mapResetControlRef.current = null;
				}

				const MapResetControl = L.Control.extend({
					options: { position: 'topleft' }, // Control-Position: oben rechts

					onAdd: function (map) {
						const container = L.DomUtil.create(
							'div',
							'leaflet-bar custom-control leaflet-control-map_reset_container leaflet-control'
						);

						const button = L.DomUtil.create(
							'a',
							'custom-control-button leaflet_control-map_reset',
							container
						);
						button.title = 'Karte zentrieren';
						button.style.outlineStyle = 'none';
						button.innerHTML = globus; // SVG-Icon einfügen

						// Event-Handling für den Button
						L.DomEvent.on(button, 'click', (e) => {
							L.DomEvent.stopPropagation(e);
							L.DomEvent.preventDefault(e);

							const mapContainer = mapRef.current.getContainer();
							alle_aktiven_marker_entfernen(mapContainer);
							popup_schliessen(mapContainer);

							if (markers.length > 0) {
								const bounds = L.latLngBounds(
									markers.map(({ latitude, longitude }) => [latitude, longitude])
								);
								map.fitBounds(bounds, { padding: [50, 50] });
							}
						});

						return container;
					},
				});

				// Control zur Karte hinzufügen
				const control = new MapResetControl();
				mapRef.current.addControl(control);
				mapResetControlRef.current = control;
			}

			// Cleanup: Control entfernen
			return () => {
				if (mapResetControlRef.current) {
					mapRef.current.removeControl(mapResetControlRef.current);
					mapResetControlRef.current = null;
				}
			};
	}, [isMapReady, markers]);

		/* =============================================================== *\
		   Jedem Marker handleMarkerClick() hinzufügen
		   wird bei Änderungen der Marker-Liste aktualisiert.
		\* =============================================================== */
		useEffect(() => {
			if (mapRef.current && mapMarkersRef.current) {
				// Füge die Klick-Events zu allen Markern hinzu
				mapMarkersRef.current.forEach((marker) => {
					if (marker) {
						handleMarkerClick(marker);
					}
				});
			}
		}, [markers]);


		/* =============================================================== *\
		   Event: Klick bei cloned-popup
		   - Edit-Button
		   - Delete-Button
		\* =============================================================== */
		useEffect(() => {
			if (!mapRef.current) return;

			const mapEl = mapRef.current.getContainer();

			const handlePopupClick = (event) => {
				const editButton = event.target.closest('.button.edit');
				const deleteButton = event.target.closest('.button.delete');

				if (!editButton && !deleteButton) return;

				const popup = event.target.closest('.leaflet-popup-content');
				if (!popup) return;

				const popupTitle = popup.querySelector('h3')?.textContent?.trim();
				const markerIndex = markers.findIndex((marker) =>
					marker.title?.trim() === popupTitle
				);

				if (markerIndex === -1) return;

				if (editButton) {
					setIsModalOpen(true);
					setEditingMarkerIndex(markerIndex);
				} else if (deleteButton) {
					setIsDeleteModalOpen(true);
					setMarkerToDeleteIndex(markerIndex);
				}
			};

			mapEl.addEventListener('click', handlePopupClick);

			return () => {
				mapEl.removeEventListener('click', handlePopupClick);
			};
		}, [isMapReady, markers]);



		useEffect(() => {
			if (!mapRef.current) return;

			const handleClickOnBlock = (event) => {
				const domTarget = event.target;

				const parentMapContainer = domTarget.closest('.wp-block-muotamap-single-map');
				if (parentMapContainer) {
					selectBlock(clientId);
				}
			};

			const mapContainer = mapRef.current.getContainer();
			mapContainer.addEventListener('click', handleClickOnBlock);

			return () => {
				mapContainer.removeEventListener('click', handleClickOnBlock);
			};
		}, [clientId]);



		/* =============================================================== *\
		   Event: Klick auf Karte
		   - Remove Cloned Popup
		   - Alle Markers auf inaktiv
		\* =============================================================== */
		useEffect(() => {
			if (!mapRef.current) return;

			const removeClonedPopupAndCleanMarkers = (event) => {
				const domTarget = event.originalEvent?.target;

				if (
					!domTarget.closest('.leaflet-marker-icon') &&
					!domTarget.closest('.button')
				) {
					const parentMapContainer = domTarget.closest('.wp-block-muotamap-single-map');
					if (parentMapContainer) {
						const existingClonedPopups = parentMapContainer.querySelectorAll('.cloned-leaflet-popup');
						existingClonedPopups.forEach((popup) => popup.remove());
					}
				}

				const mapContainer = mapRef.current.getContainer();
				alle_aktiven_marker_entfernen(mapContainer);
			};

			mapRef.current.on('click', removeClonedPopupAndCleanMarkers);

			return () => {
				mapRef.current?.off('click', removeClonedPopupAndCleanMarkers);
			};
		}, []);



		/* =============================================================== *\
		   Dragging
		\* =============================================================== */
		/*useEffect(() => {
			if (!isMapReady || !mapRef.current) return;

			mapRef.current.on('mouseup', () => {
				mapRef.current.dragging.disable();
				resetDraggable(mapRef.current);
			});

			// Optional: aufräumen
			return () => {
				mapRef.current.off('mouseup');
			};
		}, [isMapReady]);
*/



/* =============================================================== *\
   Dragging
\* =============================================================== */
useEffect(() => {
  if (!isMapReady || !mapRef.current) return;

  const map = mapRef.current;
  const container = map.getContainer();

  const isBareMapTarget = (t) =>
    t &&
    !(
      t.closest('.leaflet-marker-icon') ||
      t.closest('.leaflet-popup') ||
      t.closest('.cloned-leaflet-popup') ||
      t.closest('.button') ||
      t.closest('.leaflet-control') ||
      t.closest('.leaflet-interactive') // Polylinien etc.
    );

  const enableDragging = () => {
    map.dragging.enable();
    draggingOnRef.current = true;
    container.classList.add('dragging-on'); // optionales visuelles Feedback
  };

  const disableDragging = () => {
    // laufenden Drag sofort sauber beenden
    const d = map.dragging?._draggable;
    if (d && d._moving && typeof d.finishDrag === 'function') d.finishDrag();

    map.dragging.disable();
    draggingOnRef.current = false;
    container.classList.remove('dragging-on');

    if (typeof resetDraggable === 'function') resetDraggable(map); // falls du das nutzt
  };

  // sicherstellen: initial AUS
  disableDragging();

  // WICHTIG: Capture-Phase, damit wir VOR Leaflet reagieren
  const onPointerDownCapture = (ev) => {
    const target = ev.target;
    if (!isBareMapTarget(target)) return;

    if (draggingOnRef.current) {
      // 2. Klick → AUS (vor Leaflet, daher startet kein Drag)
      disableDragging();
      // kein stopPropagation nötig; Drag ist bereits aus
    } else {
      // 1. Klick → EIN (vor Leaflet, daher startet Drag sofort bei diesem Down)
      enableDragging();
      // Event normal durchlassen, damit Leaflet pannen kann
    }
  };

  container.addEventListener('pointerdown', onPointerDownCapture, { capture: true });

  return () => {
    container.removeEventListener('pointerdown', onPointerDownCapture, { capture: true });
    disableDragging();
  };
}, [isMapReady]);











		/* =============================================================== *\
		   Edit Return
		\* =============================================================== */
		return (
			<>
				<InspectorControls>
					<PanelBody title="Map Marker" className="inspector_container_map_markers" initialOpen={true}>
						{markers.map((marker, index) => (
							<div key={index} className="single_marker">
								<span className="marker_bezeichnung">{marker.title || `Marker ${index + 1}`}</span>
								<Button className="edit" onClick={() => openEditModal(index)}>
									<i className="fa-solid fa-pen-to-square"></i>
								</Button>
								<Button
									className="delete"
									onClick={() => {
        								setMarkerToDeleteIndex(index);
        								setIsDeleteModalOpen(true);
    								}}
								>
									<i className="fa-solid fa-trash-can"></i>
								</Button>
							</div>
						))}
						{/*<Button variant="primary" onClick={() => setEditingMarkerIndex(null)}>Marker hinzufügen</Button>*/}
						<Button
							variant="primary"
							onClick={() => {
								const mapCenter = mapRef.current.getCenter(); // Hole die Kartenmitte
								const newMarker = {
									title: `Marker ${markers.length + 1}`,
									latitude: mapCenter.lat,
									longitude: mapCenter.lng,
									text: '',
									image: '',
									linkedContent: '',
								};

								// Marker-Liste aktualisieren
								const updatedMarkers = [...markers, newMarker];
								setAttributes({ markers: updatedMarkers });

								// Neuen Marker zur Hauptkarte hinzufügen
								const newMapMarker = L.marker([newMarker.latitude, newMarker.longitude], { icon: customIcon })
									.addTo(mapRef.current)
									.bindPopup(newMarker.title || `Marker ${updatedMarkers.length}`);

								// Marker-Referenz speichern
								mapMarkersRef.current.push(newMapMarker);

								// Modal öffnen
								setEditingMarkerIndex(updatedMarkers.length - 1);
								setIsModalOpen(true);
							}}
						> Marker hinzufügen
						</Button>

					</PanelBody>
				</InspectorControls>

				<div {...blockProps} ref={mapContainerRef} />
				{isModalOpen && editingMarkerIndex !== null && (
					<Modal title="Marker bearbeiten" onRequestClose={closeModal} className="uldi_openstreetmap_overlay">
						<div className="custom-label-wrapper">
							<div class="title">Position ändern</div>
						</div>

                        <div ref={modalMapContainerRef} className="uldi_openstreetmap_overlay_map"></div>

						<div className="custom-label-wrapper">
							<TextControl
								label="Überschrift"
								value={markers[editingMarkerIndex]?.title || ''}
								onChange={(value) => {
									const updatedMarkers = [...markers];
									updatedMarkers[editingMarkerIndex].title = value;
									setAttributes({ markers: updatedMarkers });
								}}
								__nextHasNoMarginBottom={true}
							/>
						</div>

						<div className="custom-label-wrapper">
							<TextareaControl
								label="Text"
								value={markers[editingMarkerIndex]?.text || ''}
								onChange={(value) => {
									const updatedMarkers = [...markers];
									updatedMarkers[editingMarkerIndex].text = value;
									setAttributes({ markers: updatedMarkers });
								}}
								__nextHasNoMarginBottom={true}
							/>
						</div>

						<div className="custom-label-wrapper">
							<SelectControl
								label="(optional) Verlinke einen Magazinbeitrag"
								value={markers[editingMarkerIndex]?.linkedContent || ''}
								options={options.length > 0 ? options : [{ label: 'Keine Beiträge gefunden', value: '' }]}
								onChange={(value) => {
									const updatedMarkers = [...markers];
									updatedMarkers[editingMarkerIndex].linkedContent = value;
									setAttributes({ markers: updatedMarkers });
								}}
								__nextHasNoMarginBottom={true}
							/>
						</div>

						{markers[editingMarkerIndex] && (
    						<>
								<div className="custom-label-wrapper">
									<div class="custom_label">Bild</div>
									{markers[editingMarkerIndex]?.image && (
										<div class="media_container">
											<img
												src={markers[editingMarkerIndex].image}
												alt="Marker Image"
											/>
										</div>
									)}
									<MediaUploadCheck>
										<div class="media_upload_check">
											<MediaUpload
												onSelect={(media) => {
													if (media?.url) {
														const updatedMarkers = [...markers];
														updatedMarkers[editingMarkerIndex].image = media.url;
														setAttributes({ markers: updatedMarkers });
													}
												}}
												allowedTypes={['image']}
												value={markers[editingMarkerIndex]?.image || ''}
												render={({ open }) => (
													<Button variant="secondary" onClick={open}>
														{markers[editingMarkerIndex]?.image ? 'Bild ändern' : 'Bild hinzufügen'}
													</Button>
												)}
											/>
											{markers[editingMarkerIndex]?.image && (
												<Button
													isDestructive
													onClick={() => {
														const updatedMarkers = [...markers];
														updatedMarkers[editingMarkerIndex].image = '';
														setAttributes({ markers: updatedMarkers });
													}}
												>
													Bild entfernen
												</Button>
											)}
										</div>
									</MediaUploadCheck>
								</div>

    						</>
						)}
                        {/*<Button variant="secondary" className='close_modal' onClick={closeModal}>Close</Button>*/ }
                    </Modal>
				)}

				{isDeleteModalOpen && (
					<Modal title="Marker löschen" onRequestClose={closeDeleteModal} className="uldi_openstreetmap_overlay_delete_marker">
						<div className="modal-overlay">
							<div className="modal">
								<p>Sind Sie sicher, dass Sie diesen Marker löschen möchten?</p>
								<div className="modal-actions">
									<button type="button" class="components-button is-secondary" onClick={() => setIsDeleteModalOpen(false)}>Abbrechen</button>
									<button type="button" class="components-button is-primary is-warning" onClick={confirmDeleteMarker}>Ja, löschen</button>
								</div>
							</div>
						</div>
					</Modal>
				)}
			</>
		);
	},


	/* =============================================================== *\
	   Save
	\* =============================================================== */
	save: ({ attributes }) => {
		const { latitude, longitude, zoom, markers = [] } = attributes;

		const blockProps = useBlockProps.save({
			className: 'wp-block-muotamap wp-block-muotamap-single-map alignwide',
			'data-latitude': latitude,
			'data-longitude': longitude,
			'data-zoom': zoom,
			'data-markers': JSON.stringify(markers),
		});

		return <div {...blockProps}></div>;
	},
});