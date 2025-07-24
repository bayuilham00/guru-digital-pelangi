# AI Template Generation Timeout Fix

## Issue
The AI template generation was failing with a timeout error:
```
Error generating template with AI: AxiosError {message: 'timeout of 10000ms exceeded', name: 'AxiosError', code: 'ECONNABORTED', config: {…}, request: XMLHttpRequest, …}
```

## Root Cause
The 10-second timeout was too short for Google Gemini AI processing, which can take 30-60 seconds for complex template generation.

## Fixes Applied

### 1. Frontend API Client (`geminiService.ts`)
- ✅ **Increased timeout to 60 seconds** for AI generation requests
- ✅ **Enhanced error handling** with specific error messages:
  - Timeout errors: "Generasi template membutuhkan waktu terlalu lama..."
  - Rate limit errors: "Terlalu banyak permintaan AI..."
  - Server errors: "Server AI mengalami masalah..."

### 2. Frontend UI (`TemplateEdit.tsx`)
- ✅ **Better user feedback** with loading toast showing expected wait time
- ✅ **Improved button state** showing "Generating... (30-60s)" during processing
- ✅ **Enhanced error handling** displaying user-friendly error messages

### 3. Backend Server (`index.js`)
- ✅ **Server timeout increased to 2 minutes** for long-running AI requests
- ✅ **Proper timeout configuration** for Express server

## Expected Behavior Now
1. User clicks "Generate with AI" button
2. Button shows "Generating... (30-60s)" with spinner
3. Toast notification appears: "AI sedang membuat template untuk Anda. Ini mungkin membutuhkan waktu 30-60 detik."
4. Request has 60 seconds to complete (was 10 seconds)
5. Server has 2 minutes to handle the request (was default 30 seconds)
6. Better error messages if something goes wrong

## Testing
Run the test file to verify the fix:
```bash
node test-ai-timeout-fix.js
```

## Next Steps
1. Test the AI generation in the browser
2. Monitor actual generation times
3. Adjust timeouts if needed based on real usage patterns
4. Consider adding progress indicators for very long operations
