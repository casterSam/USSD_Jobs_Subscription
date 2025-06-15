const AfricasTalking = require('africastalking');

const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY || 'atsk_97cdeaf35fcfa47abbc1e09f515aa270aacd84ba58037c40633e9279d01e7ef900e4bba5',
  username: process.env.AT_USERNAME || 'sandbox'
});

module.exports = africastalking;