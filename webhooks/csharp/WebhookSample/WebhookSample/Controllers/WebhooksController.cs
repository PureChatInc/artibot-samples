using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Primitives;
using Newtonsoft.Json;

namespace WebhookSample.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class WebhooksController : ControllerBase
	{
		/// <summary>
		/// This is the header that will be sent to you containing the signature of the request
		/// based on the your secret, the HTTP method, the absolute URI, and the body of
		/// the request.
		/// </summary>
		private const string ARTIBOT_SIGNATURE_HEADER = "x-artibot-signature";

		/// <summary>
		/// Receives a POST request from ArtiBot and verifies the signature
		/// </summary>
		/// <param name="requestBody"></param>
		[HttpPost]
		public IActionResult Post([FromBody] object requestBody)
		{
			// This is the secret that you entered into your ArtiBot when you setup your webhook.
			// For better security do not embed the secret in your source but read it from a
			// config file or a key management service.
			var secret = "<Whatever you set your secret to in the ArtiBot webhook>";

			var hasValidSignature = HasValidSignature(Request, requestBody, secret);
			if (!hasValidSignature)
			{
				// Handle this as you wish
				return Unauthorized();
			}

			// The request is properly authorized.  Do your thing!

			return Ok();
		}

		private bool HasValidSignature(HttpRequest httpRequest, object requestBody, string secret)
		{
			var hasValidSignature = false;

			if (httpRequest.Headers.TryGetValue(ARTIBOT_SIGNATURE_HEADER, out StringValues signatureHeaders))
			{
				try
				{
					var calculatedSignature = GetSignature(httpRequest, requestBody, secret);
					hasValidSignature = signatureHeaders.Contains(calculatedSignature);
				}
				catch (Exception)
				{
					// Handle this if you like
				}
			}

			return hasValidSignature;
		}

		private string GetSignature(HttpRequest httpRequest, object requestBody, string secret)
		{
			var httpMethod = httpRequest.Method;
			var absoluteUri = Microsoft.AspNetCore.Http.Extensions.UriHelper.GetEncodedUrl(httpRequest);
			var content = (requestBody == null) ? "" : JsonConvert.SerializeObject(requestBody);

			var contentToSign = $"{httpMethod}&{absoluteUri}&{content}";

			return ComputeSha1Hmac(secret, contentToSign);
		}

		private static string ComputeSha1Hmac(string secret, string contentToSign)
		{
			var encoding = new UTF8Encoding();
			var keyBytes = encoding.GetBytes(secret);
			var hmacSha1 = new HMACSHA1(keyBytes);

			var messageBytes = encoding.GetBytes(contentToSign);
			var hash = hmacSha1.ComputeHash(messageBytes);

			return ByteArrayToString(hash);
		}

		private static string ByteArrayToString(byte[] byteArray)
		{
			return BitConverter.ToString(byteArray).Replace("-", "");
		}
	}
}
