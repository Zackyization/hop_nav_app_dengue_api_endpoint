// server.js
// to run, node server.js

const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

app.get('/scrape', async (req, res) => {
    try {
        const response = await axios.get('https://www.nea.gov.sg/dengue-zika/dengue/dengue-clusters');
        const $ = cheerio.load(response.data);

        const clusters = [];

        // Convert Cheerio object to an array
        const rows = Array.from($('table tbody tr').slice(1));

        // Randomly shuffle the rows
        rows.sort(() => Math.random() - 0.5);

        // Pick the first 10 rows (or less if there are fewer than 10 rows)
        const selectedRows = rows.slice(0, 10);

        selectedRows.forEach((row) => {
            const columns = $(row).find('td');

            const alertLevel = $(columns[1]).text().trim();
            const locality = $(columns[2]).text().trim();
            const casesLastTwoWeeks = $(columns[3]).text().trim();

            if (locality && casesLastTwoWeeks) {
                clusters.push({ locality, casesLastTwoWeeks, alertLevel });
            }
        });

        // Log the extracted data for debugging
        console.log('Extracted Data:');
        clusters.forEach(({ locality, casesLastTwoWeeks, alertLevel }) => {
            console.log(`Locality: ${locality}`);
            console.log(`Number of Cases: ${casesLastTwoWeeks}`);
            console.log(`Alert Level: ${alertLevel}`);
            console.log('-------------------'); // Add a separator for better readability
        });

        // Organize the data in the desired format
        const organizedData = clusters.map(({ locality, casesLastTwoWeeks, alertLevel }) => ({
            Locality: locality,
            'Number of Cases': casesLastTwoWeeks,
            'Alert Level': alertLevel,
        })).filter(entry => Object.values(entry).some(value => value !== ''));

        res.json({ success: true, data: organizedData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Error scraping data' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}/scrape`);
});
