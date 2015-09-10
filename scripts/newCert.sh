# create a request for new cert - ALWAYS PROVIDE A UNIQUE COMMON NAME
sudo /usr/local/ssl/misc/CA.sh -newreq
# create a signed x509 cert for SSL tunnel
sudo /usr/local/ssl/misc/CA.sh -sign
