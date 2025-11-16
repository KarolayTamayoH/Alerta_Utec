/**
 * CORS headers for all API responses
 */
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Content-Type": "application/json"
};

/**
 * Create a success response with CORS headers
 */
function successResponse(statusCode, data) {
  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(data)
  };
}

/**
 * Create an error response with CORS headers
 */
function errorResponse(statusCode, message, error = null) {
  const body = {
    ok: false,
    message
  };

  if (error) {
    body.error = error.message || error;
  }

  return {
    statusCode,
    headers: corsHeaders,
    body: JSON.stringify(body)
  };
}

module.exports = {
  corsHeaders,
  successResponse,
  errorResponse
};
