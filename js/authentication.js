var profile;

function defer() {
	var res, rej
	
	var promise = new Promise((resolve, reject) => {
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
    return CredentialsReady.resolve(data.Credentials);
}

function handleError(error) {
    console.log("Authentication failed: " + error);
}
