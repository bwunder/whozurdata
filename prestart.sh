openssl req -x509 -newkey rsa:1024 -keyout key.pem -out cert.pem -passin pass:keyPass -passout pass:test -days 1 -batch
