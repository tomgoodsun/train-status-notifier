// Import packages.
const axios = require('axios');
const cheerio = require('cheerio');

// Get html from https://transit.yahoo.co.jp/diainfo/area/6
// Get element from html by query '#mdStatusTroubleLine table:first-child'
// Loop each tr element that has td elemment.
// If tr element doesn't have td element, skip it.
// Get text of the first a element under the first td element and assign it to variable 'line'.
// Get text of the second span under the second td element and assign it to variable 'status'.
// Push object {line: line, status: status} to array 'result'.
// Return array 'result'.
const getTrainStatus = async () => {
  const result = [];
  const html = await getHtml();
  const $ = cheerio.load(html);
  const $table = $('#mdStatusTroubleLine table:first-child');
  $table.find('tr').each((i, elem) => {
    if ($(elem).find('td').length === 0) {
      return true;
    }
    const $td = $(elem).find('td');
    const line = $td.eq(0).find('a').text();
    const status = $td.eq(1).find('span').text();
    result.push({line: line, status: status});
  });
  return result;
}

getHtml = async () => {
  const url = 'https://transit.yahoo.co.jp/diainfo/area/6';
  const response = await axios.get(url);
  return response.data;
};

getTrainStatus().then((result) => {
  // Loop result and create message formatted like 'JR山手線: 運転見合わせ'.
  // Concat messages and assign it to variable 'message'.
  // Print 'message'.
  let message = '';
  result.forEach((elem) => {
    message += `${elem.line}: ${elem.status}\n`;
  });

  // Notify message to Slack.
  // See https://api.slack.com/messaging/webhooks
  const url = 'https://hooks.slack.com/services/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';
  // Add title to message.
  message = '運行情報\n' + message;
  axios.post(url, {text: message});

  console.log(message);
  console.log(result);
});

// Create package.json to install packages used in this script.
// $ npm init -y
// Install packages.
// $ npm install axios cheerio
// Run script.
// $ node index.js


