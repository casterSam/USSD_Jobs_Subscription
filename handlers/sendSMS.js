const AfricasTalking = require('africastalking');

// Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY || 'atsk_97cdeaf35fcfa47abbc1e09f515aa270aacd84ba58037c40633e9279d01e7ef900e4bba5',
  username: process.env.AT_USERNAME || 'sandbox'
});

exports.handler = async (event) => {
  try {
    const result = await africastalking.SMS.send({
      to: '+254714553693',
      message: 'Hey AT Ninja! Wassup...',
      from: '3417'
    });
    
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (ex) {
    console.error(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: ex.message })
    };
  }
};