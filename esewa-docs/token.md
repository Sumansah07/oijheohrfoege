Overview
API, an abbreviation of Application Program Interface, is a set of routines, protocols, and tools for building software applications. The API specifies how software components should interact. Virtually all software has to request other software to do some things for it. To accomplish this, the asking program uses a set of standardized requests, called Application Programming Interface (API). Building an application with no APIs is basically like building a house with no doors. The API for all computing purposes is how we open the blinds and the doors and exchange information.  This documentation is about Token based payment in eSewa. This helps to understand and guide those partners which are intended to integrate token based payment. Token based payment implies, a unique token is generated at the merchant end. Customer enters the token at eSewa for payment, and then request is made to the client against the token generated from merchant. Upon getting the necessary information in response, payment is made from eSewa in next step. This documentation will help to accelerate the integration efforts of client application with eSewa.


Fig: System Interaction with partner/client server for token based payment in eSewa.
The scenario visualized in above figure shows an overall communication from partner/client's Server to eSewa and finally to the partner/client's Server. Number in bracket specifies the order of process that is carried out between partner client and eSewa. Following lays the explanation:

Authentication
 eSewa supports two types of Authentication methods  • Basic Authentication: In Basic Authentication, username and password should be provided in header for every request  • Bearer Access Token:In Bearer Token Authentication, the server issues a token after successful authentication. The client includes this token in the HTTP Authorization header for subsequent requests. The server then validates the token to grant access. URL:{{base_url}}/access-token Url for login as well as for refreshing token will be same Method:POST

Sample Request for authentication:
{
"grant_type": "password/refresh_token",
"client_secret": {{base64 encoded client_secret key}},
"username": {{username}},
"password": {{base64 encoded password}}
} 
Name	Description
grantType
                                            	
As for authentication as well as for refresh token URL would be same but would be differentiated by : a)password: For authentication with username and password b) refresh_token : For authentication with refresh token

client_secret
                                            	base64 Encoded value of key with length from 32 - 64 characters long.
username
                                            	username provided by client.
password
                                            	password provided by client
Sample Response:
{
 "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJqa1ZhNWI2TzZpNTJIeEdHSUN3NFhVTkFyLWpxSUs3",
 "expires_in": 250,
 "token_type": "Bearer",
 "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkYTNlYjFjZS0wNGJlLTQ3Y2YtODlkYS02M2M5MDJ",
 "refresh_expires_in": 550
} 
Name	Description
access_token
                                            	accessToken to sent in each request.
expires_in
                                            	integer value in second for how long access_token will be valid.
token_type
                                            	prefix value of access token.
refresh_token
                                            	If access token is expired, with this token access token is fetched.
 With above response from client. Esewa send's access Token for Authentication for each request. In Header with key- Authorization. Key is constructed as : token_type + “<space>“ + access_token   Refresh Token: To refresh the token same authentication url is used with following request format :
 

Sample Request for Refresh Token:
{
"grant_type": "refresh_token",
"refresh_token": {{refresh_token from previous login}},
"client_secret": {{base64 encoded client_secret key}}
} 
Name	Description
grant_type
                                            	refresh_token for refreshing token.
refresh_token
                                            	refresh token from previous login
client_secret
                                            	base64 encoded client_secret key
Sample Response:
{
"access_token": "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJqa1ZhNWI2TzZpNTJIeEdHSUN3NFhVTkFyLWpxSUs3",
"expires_in": 200,
"token_type": "Bearer",
"refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJkYTNlYjFjZS0wNGJlLTQ3Y2YtODlkYS02M2M5MDJk",
"refresh_expires_in": 400
} 
Inquiry
 eSewa calls the partner/client's server with the token entered from user as in process 1.1 shown in figure above. If the required token is valid, response (1.2) is sent to eSewa with the necessary parameters required for payment. If the token is invalid or duplicate, error message is sent from partner/client, which is accordingly displayed to the customer. Below is the API detail-
Request-
Request is made with the unique request id or token generated by client. **Authentication(Basic or Bearer Token) should be provided for every request.
Request can be send in: 1.URL. Parameters can be send in URL as path variable,as query parameters or by mixture of both eg:Request URI- client's url/{request_id}       client's url/{request_id}/{mobile_number}(incase of multiple parameters)       client's url?{request_id}?{mobile_number}(request in query param)       client's url/{request_id}?{mobile_number}(request in mixture of both path and query)  2. Header Parameters Header must always be in JSON format.While header key's value must be in list format.  3. Body Parameters Parameters in body must be in JSON format.While header key's value must be in list format

 Note: Field name either in header, url or in body must always be in snake case i.e if we've field “Customer Id” it must always be as “customer_id”
 

Description
Field Name	Parameter Type	Field Description
request_id
                                            	String	Individually assigned unique ID for each user.
Response
Below is the response received for the above request made -

{
    "request_id": "",      
    "response_code" : "",
    "response_message": "",
    "amount": ,
    "properties": {
      "name": ""
      //address... and other parameters as per merchants (used as detail)
    }
 } 
where
Field name	Parameter Type	Field Description
request_id
                                            	String	Individually assigned unique ID for each user.
response_message
                                            	String	Success/Error Response message
response_code
                                            	int	This is the response provided by client to eSewa to know the successful completion of any transaction.-0 Success -1 Failed
amount
                                            	double	Total amount to be paid by the customer.
properties
                                            	Map	Fields in properties are dynamic as per clients. Any values may be passed in properties. Key and value both should be String.
Example:Statement Request-
 Request URI- client's url/{request_id}       client's url/{request_id}/{mobile_number}(incase of multiple parameters) Method type - GET Path variable - request_id GET: {{base_url}}/inquiry/12123122(incase of single parameter)   {{base_url}}/inquiry/12123122/9806800001(incase of multiple parameters)

Case: Success
{
 "request_id": "12123122",      
 "response_code" : 0,
 "response_message": "success",
 "amount": 1000,
 "properties": {
     "customer_name": "Ram Kumar Thapa",
     "address" : "Kathmandu",
     "customer_id": "1A4DDF",
     "invoice_number": "123456789",
     "product_name": "ABC online registration"           
 }
} 
Success Response II(In case of Package Selection)
{
    "amount": 2499,
    "request_id": "abhishek@gmail.com",
    "response_code": 0,
    "response_message": "success",
    "properties": {
        "username": "abhishek@gmail.com",
        "expiry_date": "2027-07-03",
        "phone": "9806800001"
    },
    "packages": [
        {
            "display": "One Month Package. [ 1 Month at 499 ]",
            "value": 499,
            "properties": {
                "package_id": 1
            }
        },
        {
            "display": "Three Months Package. [ 3 Months at 999 ]",
            "value": 999,
            "properties": {
                "package_id": 2
            }
        },
        {
            "display": "1 Year Package. [ 1 Year at 2499 ]",
            "value": 2499,
            "properties": {
                "package_id": 3
            }
        },
        {
            "display": "Special Package: Buy 2 Years, Get 1 Year Free. [ 3 Years at 4999 ]",
            "value": 4999,
            "properties": {
                "package_id": 4
            }
        }
    ]
} 
Case: Failure
{
  "response_code" : 1,
  "response_message" : "Invalid token"    
}
 
 Note:- fields in properties are dynamic as per clients. Any values may be passed in properties key and value both should be String
 

Payment
Request Method type - POST
**Authentication(Basic or Bearer Token) should be provided for every request.

Request
{
 "request_id": "",
 "amount": ,
 "transaction_code": ""
} 
where,
Field Name	Parameter Type	Field Description
request_id
                                            	String	Individually assigned unique ID for each user.
amount
                                            	double	Total amount to be paid by the customer.
transaction_code
                                            	String	Code generated from eSewa during payment.
Response
Below is the response received for the above request made -

{
 "request_id" : "",
 "response_code": "",
 "response_message": "",
 "amount": ,
 "reference_code": ""
} 
where,
Field Name	Parameter Type	Field Description
request_id
                                            	String	Individually assigned unique ID for each user.
response_message
                                            	String	Success/Error Response message
response_code
                                            	int	This is the response provided by client to eSewa to know the successful completion of any transaction. -0 Success -1 Failed
amount
                                            	double	Total amount to be paid by the customer.
reference_code
                                            	String	Client side code, which might be helpful during reconciliation.
Example:Payment Request-
Request URI- client's payment URI Method type - POST POST : {{base_url}}/payment

{
  "request_id": "12123122",
  "amount": 1000,
  "transaction_code": "01XV31A",
  "package_id": 1(Incase of package selection)
} 
Case: Success
{
  "request_id": "12123122",
  "response_code": 0,
  "response_message": "Payment successful",
  "amount": 1000,
  "reference_code": "12client34"
} 
Case: Failure
{
  "response_code": 1,
  "response_message": "Invalid token"
} 
 Note:- reference_code is generated from clients while making payment .
 

Status Check
Request Method type - POST
**Authentication(Basic or Bearer Token) should be provided for every request.

Request
{
 "request_id": "",
 "amount": ,
 "transaction_code": ""
} 
where,
Field Name	Parameter Type	Field Description
request_id
                                            	String	Individually assigned unique ID for each user.
amount
                                            	double	Total amount to be paid by the customer.
transaction_code
                                            	String	Code generated from eSewa during payment.
Response
Below is the response received for the above request made -

{
 "request_id" : "",
 "response_code": "",
 "status": "",
 "response_message": "",
 "amount": ,
 "reference_code": ""
} 
where,
Field Name	Parameter Type	Field Description
request_id
                                            	String	Individually assigned unique ID for each user.
response_code
                                            	int	This is the response provided by client to eSewa to know the successful completion of any transaction. -0 Success -1 Failed
status
                                            	String	This shows if transaction is success or Failed in client's end. SUCCESS for success and FAILED for failure should be provided.
response_message
                                            	String	Response error message / Response message
amount
                                            	double	Total amount to be paid by the customer.
reference_code
                                            	String	Client side code, which might be helpful during reconciliation.
Example:Status Check-
Request URI- client's payment URI Method type - POST POST : {{base_url}}/status

{
  "request_id": "12123122",
  "amount": 1000,
  "transaction_code": "01XV31A"
} 
Case: Success
{
  "request_id": "1234",
  "response_code": 0,
  "status": "SUCCESS"
  "response_message": "Payment successful",
  "amount": 1000,
  "reference_code": "ABCD"
}  
Case: Failure
{
  "request_id": "1234",
  "response_code": 1,
  "status": "FAILED"
  "response_message": "Payment failed",
  "amount": 1000,
  "reference_code": ""
}  
Case: Processing
{
  "request_id": "1234",
  "response_code": 2,
  "status": "PENDING"
  "response_message": "Payment is being processed",
  "amount": 1000,
  "reference_code": ""
}  
Case: Payment Request Not Received
{
  "request_id": "1234",
  "response_code": 3,
  "status": "NOT FOUND"
  "response_message": "Payment not found",
  "amount": 1000,
  "reference_code": ""
}  
