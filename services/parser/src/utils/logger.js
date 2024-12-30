const fs = require('fs');
const path = require('path');

function logToFile(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} - ${message}\n`;
    fs.appendFileSync('/shared/parser.log', logMessage);
    console.log(message); // Also log to console for Docker logs
}

module.exports = { logToFile }; 