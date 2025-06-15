const AfricasTalking = require('africastalking');

// Initialize Africa's Talking
const africastalking = AfricasTalking({
  apiKey: process.env.AT_API_KEY,
  username: process.env.AT_USERNAME
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