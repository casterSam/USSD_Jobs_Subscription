const jobsService = require('../services/jobsService');

exports.handler = async (event) => {
  try {
    // Parse the incoming USSD request
    const decodedBody = decodeURIComponent(event.body);
    const body = Object.fromEntries(new URLSearchParams(decodedBody));
    
    const response = await jobsService.processRequest(body);
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'text/plain' },
      body: response
    };
  } catch (error) {
    console.error('Error processing jobs subscription:', error);
    return {
      statusCode: 500,
      body: 'END An error occurred. Please try again later.\n'
    };
  }
};