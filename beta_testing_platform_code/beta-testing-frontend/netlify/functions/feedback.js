// Feedback handler with in-memory storage and Google Sheets integration
let feedbackStorage = []; // In-memory storage for feedback

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
      // Return all stored feedback
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(feedbackStorage)
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
        status: 'New',
        id: Date.now().toString(),
        sheets_synced: false
      };

      // Store in memory
      feedbackStorage.push(processedData);
      console.log('Feedback stored:', processedData);

      // Try to sync to Google Sheets
      let sheetsSuccess = false;
      try {
        sheetsSuccess = await syncToGoogleSheets(processedData);
        if (sheetsSuccess) {
          // Update the stored data to reflect successful sync
          const index = feedbackStorage.findIndex(item => item.id === processedData.id);
          if (index !== -1) {
            feedbackStorage[index].sheets_synced = true;
          }
        }
      } catch (sheetsError) {
        console.error('Google Sheets sync failed:', sheetsError);
      }

      // Return success response
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({
          ...processedData,
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

// Google Sheets integration function
async function syncToGoogleSheets(feedbackData) {
  try {
    // Check if Google Sheets credentials are available
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      console.log('GOOGLE_SERVICE_ACCOUNT not set, skipping Google Sheets sync');
      return false;
    }

    // Parse the service account JSON
    const serviceAccount = JSON.parse(serviceAccountJson);
    
    // Import gspread dynamically
    const { google } = await import('googleapis');
    
    // Create JWT client
    const auth = new google.auth.JWT(
      serviceAccount.client_email,
      null,
      serviceAccount.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    // Create sheets API client
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Get the spreadsheet ID from environment
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      console.log('GOOGLE_SHEET_ID not set, skipping Google Sheets sync');
      return false;
    }

    // Prepare the data to append
    const values = [
      [
        feedbackData.tester_name,
        feedbackData.submission_type,
        feedbackData.title,
        feedbackData.description,
        feedbackData.severity || '',
        feedbackData.timestamp,
        feedbackData.status
      ]
    ];

    // Append to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: spreadsheetId,
      range: 'Sheet1!A:G',
      valueInputOption: 'RAW',
      resource: { values }
    });

    console.log('Successfully synced to Google Sheets');
    return true;

  } catch (error) {
    console.error('Google Sheets sync error:', error);
    return false;
  }
}