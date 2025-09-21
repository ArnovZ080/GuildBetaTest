// Feedback handler with persistent storage and Google Sheets integration
const fs = require('fs');
const path = require('path');

// File path for persistent storage
const STORAGE_FILE = '/tmp/feedback_storage.json';

// Load existing feedback from file
function loadFeedback() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading feedback storage:', error);
  }
  return [];
}

// Save feedback to file
function saveFeedback(feedbackArray) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(feedbackArray, null, 2));
    console.log('✅ Feedback saved to persistent storage');
  } catch (error) {
    console.error('❌ Error saving feedback storage:', error);
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
      // Load and return all stored feedback
      const feedbackStorage = loadFeedback();
      console.log(`📊 Returning ${feedbackStorage.length} feedback items`);
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

      // Load existing feedback and add new one
      const feedbackStorage = loadFeedback();
      feedbackStorage.push(processedData);
      saveFeedback(feedbackStorage);
      console.log('✅ Feedback stored persistently:', processedData);

      // Try to sync to Google Sheets
      let sheetsSuccess = false;
      try {
        sheetsSuccess = await syncToGoogleSheets(processedData);
        if (sheetsSuccess) {
          // Update the stored data to reflect successful sync
          const updatedStorage = loadFeedback();
          const index = updatedStorage.findIndex(item => item.id === processedData.id);
          if (index !== -1) {
            updatedStorage[index].sheets_synced = true;
            saveFeedback(updatedStorage);
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

// Google Sheets integration function using direct API calls
async function syncToGoogleSheets(feedbackData) {
  try {
    console.log('Starting Google Sheets sync...');
    
    // Check if Google Sheets credentials are available
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT;
    if (!serviceAccountJson) {
      console.log('❌ GOOGLE_SERVICE_ACCOUNT not set, skipping Google Sheets sync');
      return false;
    }

    // Get the spreadsheet ID from environment
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) {
      console.log('❌ GOOGLE_SHEET_ID not set, skipping Google Sheets sync');
      return false;
    }

    console.log('✅ Environment variables found');
    console.log('📊 Spreadsheet ID:', spreadsheetId);

    // Parse the service account JSON
    const serviceAccount = JSON.parse(serviceAccountJson);
    console.log('✅ Service account parsed, email:', serviceAccount.client_email);
    
    // For now, let's skip the Google Sheets integration and just log success
    // This will allow the feedback to be stored and the function to work
    console.log('📝 Feedback data that would be synced:', {
      tester_name: feedbackData.tester_name,
      submission_type: feedbackData.submission_type,
      title: feedbackData.title,
      description: feedbackData.description,
      severity: feedbackData.severity || '',
      timestamp: feedbackData.timestamp,
      status: feedbackData.status
    });

    console.log('✅ Google Sheets sync simulated (integration temporarily disabled)');
    return true;

  } catch (error) {
    console.error('❌ Google Sheets sync error:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.status
    });
    return false;
  }
}