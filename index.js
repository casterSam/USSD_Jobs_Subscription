require('dotenv').config();

// Import all handlers
const sendSMS = require('./handlers/sendSMS');
const jobsSubscription = require('./handlers/jobsSubscription');

// Unified Lambda handler
exports.handler = async (event, context) => {
  // Check if this is a USSD request (jobs subscription)
  if (event.body && event.body.includes('phoneNumber') && event.body.includes('text')) {
    return jobsSubscription.handler(event, context);
  }
  
  // Default to SMS sending for other cases
  return sendSMS.handler(event, context);
};