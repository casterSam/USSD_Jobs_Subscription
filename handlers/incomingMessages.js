exports.handler = async (event) => {
  try {
    console.log('Received message:', event.body);
    return {
      statusCode: 200,
      body: 'OK'
    };
  } catch (ex) {
    console.error(ex);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: ex.message })
    };
  }
};