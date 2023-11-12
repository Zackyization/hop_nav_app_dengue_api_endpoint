// to run, php -S localhost:8000
// Use const or let for variable declarations to avoid implicit global variables
const MAX_OPACITY_NUM = 100;
const MAX_OPACITY = 0.8;

const map = L.map('map').setView([1.35, 103.82], 12);
let geoJsonLayer;
let jsons;
let jsonDates;

// Use a template string for the tile layer URL
const googleMapsTileLayer = new L.GridLayer.GoogleMutant({
    type: 'roadmap' // You can change this to 'satellite' or other types
  }).addTo(map);

// Populates the 'jsons' and 'jsonDates' variables
async function populateJsons() {
    try {
        const response = await fetch('http://localhost:5000/api/dengue_clusters');
        const data = await response.json();
        jsons = [data];
        jsonDates = ['Latest Data'];
    } catch (error) {
        console.error('Error populating JSON data:', error);
    }
}

// Use a more descriptive function name
async function getFilenames() {
    return new Promise((res, rej) => {
        jQuery.ajax({
            type: 'POST',
            url: 'dir.php',
            dataType: 'json',
            success: (data) => res(data),
            error: (err) => rej(err)
        });
    });
}

// Use async/await for better readability
async function getJson(filename) {
    try {
        const response = await fetch(`data/${filename}.json`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching JSON for ${filename}:`, error);
        throw error;
    }
}

// Extracted date formatting into a separate function
function formatJsonDate(filename) {
    const [year, month, day] = filename.split('-').slice(1, 4).reverse();
    return `${day}/${month}/${year}`;
}

// Use const/let for variable declarations
function style(feature) {
    const min = (a, b) => a < b ? a : b;
    const case_size = feature.properties.case_size;
    if (case_size >= 10) {
        return { color: 'red', weight: 2, fillOpacity: min(case_size / MAX_OPACITY_NUM * MAX_OPACITY, MAX_OPACITY) };
    } else {
        return { color: 'orange', weight: 2 };
    }
}

// Use const/let for variable declarations
function onEachFeature(feature, layer) {
    const description = feature.properties.description;
    const case_size = feature.properties.case_size;

    const popupContent = `<b>Cluster: </b>${description}<br/><b>Case Size: </b>${case_size}`;

    layer.bindPopup(popupContent);
}

function displayGeoJson(index) {
    if (geoJsonLayer) geoJsonLayer.clearLayers();

    const data = jsons.slice(index)[0];
    geoJsonLayer = L.geoJSON(data, {
        onEachFeature: onEachFeature,
        style: style
    }).addTo(map);

    const date = jsonDates[index];
    const text = document.getElementById('text');
    text.innerHTML = date;
}

// Use const/let for variable declarations
function sliderUpdate(value) {
    displayGeoJson(value - 1);
}

// Use const/let for variable declarations
function enableSliderAndText() {
    const slider = document.getElementById('slider');
    slider.style.visibility = 'visible';
    slider.min = 1;
    slider.max = jsons.length;
    slider.value = jsons.length;

    const text = document.getElementById('text');
    text.style.visibility = 'visible';
}

async function main() {
    await populateJsons();
    enableSliderAndText();
    displayGeoJson(jsons.length - 1);
}

main();
