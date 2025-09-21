# Environment Variables Setup

## Google Service Account Configuration

The application now uses the `GOOGLE_SERVICE_ACCOUNT` environment variable instead of a local file for security.

### Setting up the Environment Variable

1. **Get your service account JSON**: Download the service account JSON file from Google Cloud Console
2. **Set the environment variable**: The entire JSON content should be set as a single string

### Format

The `GOOGLE_SERVICE_ACCOUNT` environment variable should contain the complete JSON as a string:

```bash
export GOOGLE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"...","universe_domain":"googleapis.com"}'
```

### For Netlify Deployment

1. Go to your Netlify site dashboard
2. Navigate to Site settings > Environment variables
3. Add a new variable:
   - **Key**: `GOOGLE_SERVICE_ACCOUNT`
   - **Value**: Your complete service account JSON as a string

### For Local Development

Create a `.env` file in the project root:

```bash
GOOGLE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

Or export it in your shell:

```bash
export GOOGLE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```

### Security Notes

- ✅ The service account template file now contains placeholder values
- ✅ No sensitive data is stored in the repository
- ✅ Environment variables are secure and not committed to version control
- ✅ The application will gracefully handle missing environment variables

### Troubleshooting

If you get "GOOGLE_SERVICE_ACCOUNT environment variable not set":
1. Verify the environment variable is set correctly
2. Check that the JSON is properly formatted (no line breaks in the string)
3. Ensure the service account has the necessary permissions for Google Sheets
