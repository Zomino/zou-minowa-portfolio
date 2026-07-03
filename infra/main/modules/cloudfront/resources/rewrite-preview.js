function handler(event) {
  var request = event.request;
  var host = request.headers.host.value;
  var label = host.split(".")[0];
  var uri = request.uri;

  if (uri.endsWith("/")) {
    uri = uri + "index.html";
  } else if (!uri.includes(".")) {
    uri = uri + "/index.html";
  }

  request.uri = "/" + label + uri;

  return request;
}
