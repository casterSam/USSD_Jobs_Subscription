const africastalking = require('../lib/africastalking');
const mysql = require('mysql2/promise');

// Database configuration
const DB_CONFIG = {
  host: process.env.DB_HOST || 'betting-tips-db.c8vy8aac62dh.us-east-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'ussdappstorage254',
  database: process.env.DB_NAME || 'ussd_app',
  port: process.env.DB_PORT || 3306
};

// Initialize SMS service
const sms = africastalking.SMS;

// Sample jobs data
const SAMPLE_JOBS = [
  {
    title: "Software Developer",
    company: "Tech Solutions Ltd",
    location: "Nairobi",
    salary: "KSh 150,000 - 200,000",
    deadline: "2023-12-15",
    description: "Looking for an experienced JavaScript developer with Node.js skills"
  }
];

module.exports = {
  async processRequest(body) {
    const text = body?.text || '';
    const phoneNumber = body?.phoneNumber || '';
    const inputArray = text.split('*');
    const level = inputArray.length;

    // Main menu
    if (text === '') {
      return 'CON Jobs Subscription\n' +
             '1. Subscribe for Daily Jobs\n' +
             '2. Unsubscribe\n' +
             '3. Send Sample Jobs (Test)\n' +
             '0. Exit\n';
    } 
    // Option selected
    else if (level === 1) {
      const input = inputArray[0];
      
      if (input === '1') return this.handleSubscribe(phoneNumber);
      if (input === '2') return this.handleUnsubscribe(phoneNumber);
      if (input === '3') return this.sendSampleJobs(phoneNumber);
      if (input === '0') return 'END Thank you for using our service. Goodbye!\n';
      
      return 'END Invalid option selected. Please try again.\n';
    } 
    
    return 'END Invalid input. Please try again.\n';
  },

  async sendSampleJobs(phoneNumber) {
    try {
      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : 
                           phoneNumber.startsWith('254') ? `+${phoneNumber}` :
                           `+254${phoneNumber.substring(1)}`;

      // Get first sample job
      const job = SAMPLE_JOBS[0];
      const message = `Job: ${job.title}\nCompany: ${job.company}\nLocation: ${job.location}\nDeadline: ${job.deadline}`;

      // Send via Africa's Talking
      await sms.send({
        to: formattedPhone,
        message: message,
        from: '3417'
      });

      return 'END Sample job sent to your phone via SMS.\n';
    } catch (error) {
      console.error('Error sending sample jobs:', error);
      return 'END Failed to send sample job. Please try again later.\n';
    }
  },

  async handleSubscribe(phoneNumber) {
    try {
      const connection = await mysql.createConnection(DB_CONFIG);
      
      // Check if user exists
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE phone_number = ?', 
        [phoneNumber]
      );

      let userId;
      if (users.length === 0) {
        const [result] = await connection.execute(
          'INSERT INTO users (phone_number) VALUES (?)', 
          [phoneNumber]
        );
        userId = result.insertId;
      } else {
        userId = users[0].id;
      }

      // Check if already subscribed and active
      const [existingSub] = await connection.execute(
        'SELECT id, is_active FROM job_subscriptions WHERE user_id = ?',
        [userId]
      );

      if (existingSub.length > 0) {
        if (existingSub[0].is_active) {
          return 'END You are already subscribed to daily job alerts.\n';
        } else {
          // Reactivate subscription
          await connection.execute(
            'UPDATE job_subscriptions SET is_active = TRUE WHERE user_id = ?',
            [userId]
          );
          
          // Send confirmation SMS
          try {
            await sms.send({
              to: phoneNumber,
              message: 'You have successfully re-subscribed to daily job alerts.'
            });
          } catch (smsError) {
            console.error('Error sending SMS:', smsError);
          }
          
          return 'END You have re-subscribed to daily job alerts.\n';
        }
      } else {
        // Create new subscription
        await connection.execute(
          'INSERT INTO job_subscriptions (user_id, phone_number) VALUES (?, ?)',
          [userId, phoneNumber]
        );

        // Send confirmation SMS
        try {
          await sms.send({
            to: phoneNumber,
            message: 'You have successfully subscribed to daily job alerts. You will receive new job listings via SMS daily.'
          });
        } catch (smsError) {
          console.error('Error sending SMS:', smsError);
        }

        return 'END You have subscribed to daily job alerts. You will receive new jobs via SMS.\n';
      }

      await connection.end();
    } catch (error) {
      console.error('Database error:', error);
      return 'END An error occurred. Please try again later.\n';
    }
  },

  async handleUnsubscribe(phoneNumber) {
    try {
      const connection = await mysql.createConnection(DB_CONFIG);
      
      // Check if user exists
      const [users] = await connection.execute(
        'SELECT id FROM users WHERE phone_number = ?', 
        [phoneNumber]
      );

      if (users.length === 0) {
        return 'END You are not subscribed to job alerts.\n';
      } else {
        const userId = users[0].id;
        
        // Check if subscribed
        const [existingSub] = await connection.execute(
          'SELECT id, is_active FROM job_subscriptions WHERE user_id = ?',
          [userId]
        );

        if (existingSub.length === 0) {
          return 'END You are not subscribed to job alerts.\n';
        } else if (!existingSub[0].is_active) {
          return 'END You are already unsubscribed from job alerts.\n';
        } else {
          // Update subscription
          await connection.execute(
            'UPDATE job_subscriptions SET is_active = FALSE WHERE user_id = ?',
            [userId]
          );

          // Send confirmation SMS
          try {
            await sms.send({
              to: phoneNumber,
              message: 'You have successfully unsubscribed from job alerts. You will no longer receive job listings via SMS.'
            });
          } catch (smsError) {
            console.error('Error sending SMS:', smsError);
          }

          return 'END You have unsubscribed from job alerts. You will no longer receive jobs.\n';
        }
      }

      await connection.end();
    } catch (error) {
      console.error('Database error:', error);
      return 'END An error occurred. Please try again later.\n';
    }
  }
};