// Simple feedback handler without external dependencies for now
// TODO: Add Google Sheets integration once basic function works

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    if (event.httpMethod === 'GET') {
      // Get all feedback (for now, return empty array since we don't have a database)
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify([])
      };
    }

    if (event.httpMethod === 'POST') {
      const feedbackData = JSON.parse(event.body);
      
      // Validate required fields
      const requiredFields = ['tester_name', 'submission_type', 'title', 'description'];
      for (const field of requiredFields) {
        if (!feedbackData[field]) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: `Missing required field: ${field}` })
          };
        }
      }

      // Add timestamp and status
      const processedData = {
        ...feedbackData,
        timestamp: new Date().toISOString(),
        status: 'New'
      };

      // TODO: Add Google Sheets integration
      let sheetsSuccess = false;
      console.log('Feedback received:', processedData);

      // Return success response
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          ...processedData,
          id: Date.now().toString(),
          sheets_synced: sheetsSuccess
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};