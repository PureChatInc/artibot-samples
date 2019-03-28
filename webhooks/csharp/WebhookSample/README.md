How to run the sample application:

- From the command line:
  - Change directory (cd) to artibot-samples/webhooks/csharp/WebhookSample/WebhookSample
  - dotnet run
  
- From Visual Studio:
  - Open the solution file
  - Press f5 to run the application

How to test:

Use Postman or a similar tool to compose a request as follows:
  - HTTP method: POST
  - URL: http://localhost:5000/api/webhooks
  - Body: "{}" (without the quotes)
  - Headers
    - Key: Content-Type, Value: application/json
    - Key: x-artibot-signature, Value: D3817110D46EBB2678A3752F4912C74B2A3E736E
    
 Execute the request.  The request should return a 200 OK.
 
 Changing the x-artibot-signature, the URL (for example by adding query string parameters), or the body should return a 401 Unauthorized.
