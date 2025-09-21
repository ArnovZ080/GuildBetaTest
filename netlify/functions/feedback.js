const { google } = require('googleapis');

// Google Sheets configuration
const SPREADSHEET_NAME = 'Beta Tester Feedback';

// Helper function to get Google Sheets client
async function getSheetsClient() {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      throw new Error('GOOGLE_SERVICE_ACCOUNT environment variable not set');
    }

    const serviceAccount = JSON.parse(serviceAccountJson);
    const auth = new google.auth.GoogleAuth({
      credentials: serviceAccount,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    return google.sheets({ version: 'v4', auth });
  } catch (error) {
    console.error('Error setting up Google Sheets client:', error);
    throw error;
  }
}

// Helper function to append to Google Sheets
async function appendToGoogleSheet(feedbackData) {
  try {
    const sheets = await getSheetsClient();
    
    // Prepare row data
    const rowData = [
      feedbackData.timestamp,
      feedbackData.tester_name,
      feedbackData.submission_type,
      feedbackData.title,
      feedbackData.description,
      feedbackData.severity || '',
      feedbackData.status || 'New'
    ];

    // Get the spreadsheet ID from environment variable or use a default
    const spreadsheetId = process.env.GOOGLE_SHEET_ID || '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms'; // Replace with your actual sheet ID
    
    // Append the row to the spreadsheet
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'RAW',
      resource: {
        values: [rowData]
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
}

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

      // Try to append to Google Sheets
      let sheetsSuccess = false;
      try {
        await appendToGoogleSheet(processedData);
        sheetsSuccess = true;
      } catch (error) {
        console.error('Google Sheets sync failed:', error);
        // Continue without failing the request
      }

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
