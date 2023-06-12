// Import packages.
const axios = require('axios');
const cheerio = require('cheerio');
const config = require('./config');

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
};

getHtml = async () => {
  const response = await axios.get(config.url);
  return response.data;
};

// add main function
// call getTrainStatus() and get result
// catch error and print it
const main = async () => {
  try {
    const result = await getTrainStatus();

    let message = '';
    result.forEach((elem) => {
      message += `${elem.line}: ${elem.status}\n`;
    });
    // Use Yoda notation to avoid mistake.
    if (message.length === 0) {
      message = '運行情報はありません。';
    }

    // Add title to message.
    message = '運行情報\n' + message;

    // Notify message to Slack.
    // See https://api.slack.com/messaging/webhooks
    axios.post(config.slack.url, {text: message});

    console.log(message);

  } catch (error) {
    console.error(error.getCode());
    console.error(error.getMessage());
  }
};

main();
