var profile;

function defer() {
	let res, rej
	let promise = new Promise((resolve, reject) => {
		res = resolve;
		rej = reject;
	});
	promise.resolve = ()=>{console.log("Credentials Ready");res());
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
    profile = googleUser.getBasicProfile();
    var idToken = googleUser.getAuthResponse().id_token;
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
                resolve(data);
            }
        });
    });
}

function handleSTSResponse(data) {
    AWS.config.credentials = new AWS.Credentials(
        data.Credentials.AccessKeyId,
        data.Credentials.SecretAccessKey,
        data.Credentials.SessionToken);
    AWS.config.region = window.config.region;
    return  CredentialsReady.resolve()
}

function signHttpRequest(method,path) {
    return CredentialsReady.then((method,path)=>{
	    let request = new AWS.HttpRequest(window.config.apiGatewayUrl, window.config.region);
	    request.method = method;
	    request.path = window.config.apiGatewayPath;
	    request.path += path
	    request.headers['Host'] = request.endpoint.host;
	    // Signing
	    var signer = new AWS.Signers.V4(request, 'execute-api');
	    signer.addAuthorization(AWS.config.credentials, AWS.util.date.getDate());
	    //repackage for Axios
	    let r = signer.request
	    delete r.headers.Host
	    return {
	    	method : r.method,
		url : r.path,
		baseURL : r.endpoint.href,
		headers : r.headers
	    }
    });
}

function handleError(error) {
    console.log("Authentication failed: " + error);
}
