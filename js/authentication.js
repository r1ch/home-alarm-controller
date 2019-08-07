var profile;

function defer() {
	let res, rej
	let promise = new Promise((resolve, reject) => {
		res = resolve;
		rej = reject;
	});
	promise.resolve = res;
	promise.reject = rej;
	return promise;
}

var CredentialsReady = defer()

function authenticate(googleUser) {
    getIdToken(googleUser)
        .then(AWSSTSSignIn)
        .then(handleSTSResponse)
        .catch(handleError);
};

function getIdToken(googleUser) {
    // Useful data for your client-side scripts:
    profile = googleUser.getBasicProfile();
    // Profile ID can be used in IAM roles for authorization by using accounts.google.com:sub
    console.log("Google ID: " + profile.getId());
    // The ID token needed for web identity authentication:
    var idToken = googleUser.getAuthResponse().id_token;
    console.log("Google ID Token: " + idToken);
    
    return new Promise(function (resolve) {
        resolve(idToken);
    });
}

function AWSSTSSignIn(idToken) {
    var sts = new AWS.STS();
    var params = {
        RoleArn: window.config.roleArn, /* required */
        RoleSessionName: "AssumeRoleSession", /* required */
        WebIdentityToken: idToken /* required */
    };
    return new Promise(function (resolve, reject) {
        sts.assumeRoleWithWebIdentity(params, function (err, data) {
            if (err) {
                reject(err);
            } else {
                // Returning STS response
                console.log("STS credentials: " + JSON.stringify(data.Credentials));
                resolve(data);
            }
        });
    });
}

function handleSTSResponse(data) {
    // Setting AWS config credentials globally
    AWS.config.credentials = new AWS.Credentials(
        data.Credentials.AccessKeyId,
        data.Credentials.SecretAccessKey,
        data.Credentials.SessionToken);
    AWS.config.region = window.config.region;
    // Sending sign-in parameters to lambda function
    var signInParameters = {
        "sessionId": data.Credentials.AccessKeyId,
        "sessionKey": data.Credentials.SecretAccessKey,
        "sessionToken": data.Credentials.SessionToken
    };
    return new Promise(function (resolve) {
        resolve(signInParameters);
    })
}

function signHttpRequest(method,path) {
    // Setting AWS Signed header
    var request = new AWS.HttpRequest(window.config.apiGatewayUrl, window.config.region);
    request.method = method;
    request.path = window.config.apiGatewayPath;
    request.path += path
    // Needed for proper signature generation
    request.headers['Host'] = request.endpoint.host;
    // Signing
    var signer = new AWS.Signers.V4(request, 'execute-api');
    signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
    return new Promise(function (resolve) {
        resolve(signer.request);
    });
}

function handleError(error) {
    console.log("Authentication failed: " + error);
}
