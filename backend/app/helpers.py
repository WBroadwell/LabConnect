"""Helper functions for the application."""


def prepare_flask_request(request):
    """Prepare Flask request for SAML processing."""
    url_data = request.host_url + request.script_root
    return {
        "https": "on" if request.scheme == "https" else "off",
        "http_host": request.host,
        "script_name": request.path,
        "server_port": url_data.split(":")[2].rstrip("/") if url_data.count(":") > 1 else ("443" if request.scheme == "https" else "80"),
        "get_data": request.args.copy(),
        "post_data": request.form.copy(),
    }
