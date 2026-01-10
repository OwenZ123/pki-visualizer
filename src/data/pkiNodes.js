export const pkiNodes = [
  {
    id: 'root-ca',
    label: 'Root CA',
    category: 'ca',
    description: 'Self-signed certificate authority that serves as the trust anchor. Root CAs are typically kept offline for security.',
    commands: [
      {
        title: 'Generate Root CA Private Key',
        command: 'openssl genrsa -aes256 -out root-ca.key 4096',
        description: 'Generate a 4096-bit RSA private key with AES-256 encryption'
      },
      {
        title: 'Generate Root CA Private Key (EC)',
        command: 'openssl ecparam -genkey -name secp384r1 | openssl ec -aes256 -out root-ca.key',
        description: 'Generate an EC private key using P-384 curve with AES-256 encryption'
      },
      {
        title: 'Create Self-Signed Root CA Certificate',
        command: 'openssl req -x509 -new -nodes -key root-ca.key -sha256 -days 3650 -out root-ca.crt -subj "/C=US/ST=State/L=City/O=Organization/CN=Root CA"',
        description: 'Create a self-signed root CA certificate valid for 10 years'
      },
      {
        title: 'View Root CA Certificate',
        command: 'openssl x509 -in root-ca.crt -text -noout',
        description: 'Display the full details of the root CA certificate'
      },
      {
        title: 'Verify Root CA is Self-Signed',
        command: 'openssl verify -CAfile root-ca.crt root-ca.crt',
        description: 'Verify the root CA certificate is properly self-signed'
      },
      {
        title: 'Extract Public Key from Root CA',
        command: 'openssl x509 -in root-ca.crt -pubkey -noout > root-ca-public.pem',
        description: 'Extract the public key from the root CA certificate'
      }
    ]
  },
  {
    id: 'intermediate-ca',
    label: 'Intermediate CA',
    category: 'ca',
    description: 'Subordinate CA signed by the Root CA. Used to issue end-entity certificates, protecting the root CA from exposure.',
    commands: [
      {
        title: 'Generate Intermediate CA Private Key',
        command: 'openssl genrsa -aes256 -out intermediate-ca.key 4096',
        description: 'Generate a 4096-bit RSA private key for the intermediate CA'
      },
      {
        title: 'Create CSR for Intermediate CA',
        command: 'openssl req -new -key intermediate-ca.key -out intermediate-ca.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=Intermediate CA"',
        description: 'Create a certificate signing request for the intermediate CA'
      },
      {
        title: 'Sign Intermediate CA with Root CA',
        command: 'openssl x509 -req -in intermediate-ca.csr -CA root-ca.crt -CAkey root-ca.key -CAcreateserial -out intermediate-ca.crt -days 1825 -sha256 -extfile <(echo "basicConstraints=critical,CA:TRUE,pathlen:0\nkeyUsage=critical,keyCertSign,cRLSign")',
        description: 'Sign the intermediate CA certificate with the root CA (valid 5 years)'
      },
      {
        title: 'Create Certificate Chain File',
        command: 'cat intermediate-ca.crt root-ca.crt > ca-chain.crt',
        description: 'Create a certificate chain file containing intermediate and root CA'
      },
      {
        title: 'Verify Intermediate CA Against Root',
        command: 'openssl verify -CAfile root-ca.crt intermediate-ca.crt',
        description: 'Verify the intermediate CA certificate against the root CA'
      },
      {
        title: 'View Intermediate CA Certificate',
        command: 'openssl x509 -in intermediate-ca.crt -text -noout',
        description: 'Display the full details of the intermediate CA certificate'
      }
    ]
  },
  {
    id: 'server-cert',
    label: 'Server Certificate',
    category: 'cert',
    description: 'End-entity certificate for TLS/SSL servers. Contains the server\'s public key and identity information.',
    commands: [
      {
        title: 'Generate Server Private Key',
        command: 'openssl genrsa -out server.key 2048',
        description: 'Generate a 2048-bit RSA private key for the server'
      },
      {
        title: 'Create Server CSR',
        command: 'openssl req -new -key server.key -out server.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=www.example.com"',
        description: 'Create a certificate signing request for the server'
      },
      {
        title: 'Create Server CSR with SANs',
        command: 'openssl req -new -key server.key -out server.csr -subj "/CN=www.example.com" -addext "subjectAltName=DNS:www.example.com,DNS:example.com,IP:192.168.1.1"',
        description: 'Create a CSR with Subject Alternative Names for multiple domains/IPs'
      },
      {
        title: 'Sign Server Certificate',
        command: 'openssl x509 -req -in server.csr -CA intermediate-ca.crt -CAkey intermediate-ca.key -CAcreateserial -out server.crt -days 365 -sha256 -extfile <(echo "subjectAltName=DNS:www.example.com,DNS:example.com")',
        description: 'Sign the server certificate with the intermediate CA'
      },
      {
        title: 'View Server Certificate',
        command: 'openssl x509 -in server.crt -text -noout',
        description: 'Display the full details of the server certificate'
      },
      {
        title: 'Verify Server Certificate Chain',
        command: 'openssl verify -CAfile ca-chain.crt server.crt',
        description: 'Verify the server certificate against the CA chain'
      },
      {
        title: 'Check Certificate Expiration',
        command: 'openssl x509 -in server.crt -noout -enddate',
        description: 'Display the expiration date of the server certificate'
      },
      {
        title: 'Test TLS Connection',
        command: 'openssl s_client -connect www.example.com:443 -servername www.example.com',
        description: 'Test TLS connection and view the certificate presented by the server'
      }
    ]
  },
  {
    id: 'client-cert',
    label: 'Client Certificate',
    category: 'cert',
    description: 'End-entity certificate for client authentication. Used in mutual TLS (mTLS) to verify client identity.',
    commands: [
      {
        title: 'Generate Client Private Key',
        command: 'openssl genrsa -out client.key 2048',
        description: 'Generate a 2048-bit RSA private key for the client'
      },
      {
        title: 'Create Client CSR',
        command: 'openssl req -new -key client.key -out client.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=client@example.com"',
        description: 'Create a certificate signing request for the client'
      },
      {
        title: 'Sign Client Certificate',
        command: 'openssl x509 -req -in client.csr -CA intermediate-ca.crt -CAkey intermediate-ca.key -CAcreateserial -out client.crt -days 365 -sha256 -extfile <(echo "extendedKeyUsage=clientAuth")',
        description: 'Sign the client certificate with clientAuth extended key usage'
      },
      {
        title: 'Create PKCS#12 Bundle',
        command: 'openssl pkcs12 -export -out client.p12 -inkey client.key -in client.crt -certfile ca-chain.crt',
        description: 'Create a PKCS#12 file containing client cert, key, and CA chain'
      },
      {
        title: 'View Client Certificate',
        command: 'openssl x509 -in client.crt -text -noout',
        description: 'Display the full details of the client certificate'
      },
      {
        title: 'Test mTLS Connection',
        command: 'openssl s_client -connect server:443 -cert client.crt -key client.key -CAfile ca-chain.crt',
        description: 'Test mutual TLS connection using client certificate'
      }
    ]
  },
  {
    id: 'private-key',
    label: 'Private Key',
    category: 'key',
    description: 'Secret cryptographic key used for signing and decryption. Must be kept secure and never shared.',
    commands: [
      {
        title: 'Generate RSA Private Key',
        command: 'openssl genrsa -out private.key 2048',
        description: 'Generate a 2048-bit RSA private key (unencrypted)'
      },
      {
        title: 'Generate Encrypted RSA Private Key',
        command: 'openssl genrsa -aes256 -out private.key 4096',
        description: 'Generate a 4096-bit RSA private key with AES-256 encryption'
      },
      {
        title: 'Generate EC Private Key',
        command: 'openssl ecparam -genkey -name prime256v1 -out private-ec.key',
        description: 'Generate an EC private key using P-256 curve'
      },
      {
        title: 'View Private Key Details',
        command: 'openssl rsa -in private.key -text -noout',
        description: 'Display the details of an RSA private key'
      },
      {
        title: 'View EC Private Key Details',
        command: 'openssl ec -in private-ec.key -text -noout',
        description: 'Display the details of an EC private key'
      },
      {
        title: 'Encrypt Existing Private Key',
        command: 'openssl rsa -in private.key -aes256 -out private-encrypted.key',
        description: 'Add password protection to an existing private key'
      },
      {
        title: 'Remove Password from Private Key',
        command: 'openssl rsa -in private-encrypted.key -out private.key',
        description: 'Remove password protection from a private key'
      },
      {
        title: 'Convert PEM to DER Format',
        command: 'openssl rsa -in private.key -outform DER -out private.der',
        description: 'Convert private key from PEM to DER format'
      },
      {
        title: 'Convert DER to PEM Format',
        command: 'openssl rsa -in private.der -inform DER -out private.key',
        description: 'Convert private key from DER to PEM format'
      },
      {
        title: 'Check Key Matches Certificate',
        command: 'diff <(openssl x509 -in cert.crt -pubkey -noout) <(openssl rsa -in private.key -pubout)',
        description: 'Verify that a private key matches a certificate'
      }
    ]
  },
  {
    id: 'public-key',
    label: 'Public Key',
    category: 'key',
    description: 'Cryptographic key that can be freely shared. Used for encryption and signature verification.',
    commands: [
      {
        title: 'Extract Public Key from Private Key',
        command: 'openssl rsa -in private.key -pubout -out public.key',
        description: 'Extract the public key from an RSA private key'
      },
      {
        title: 'Extract Public Key from EC Private Key',
        command: 'openssl ec -in private-ec.key -pubout -out public-ec.key',
        description: 'Extract the public key from an EC private key'
      },
      {
        title: 'Extract Public Key from Certificate',
        command: 'openssl x509 -in cert.crt -pubkey -noout > public.key',
        description: 'Extract the public key from a certificate'
      },
      {
        title: 'View Public Key Details',
        command: 'openssl rsa -pubin -in public.key -text -noout',
        description: 'Display the details of an RSA public key'
      },
      {
        title: 'View EC Public Key Details',
        command: 'openssl ec -pubin -in public-ec.key -text -noout',
        description: 'Display the details of an EC public key'
      },
      {
        title: 'Convert Public Key to SSH Format',
        command: 'ssh-keygen -f public.key -i -m PKCS8 > public_ssh.pub',
        description: 'Convert a public key to OpenSSH format'
      },
      {
        title: 'Get Public Key Fingerprint',
        command: 'openssl rsa -pubin -in public.key -outform DER | openssl dgst -sha256',
        description: 'Calculate SHA-256 fingerprint of a public key'
      }
    ]
  },
  {
    id: 'csr',
    label: 'CSR',
    category: 'request',
    description: 'Certificate Signing Request - a message sent to a CA to request a signed certificate. Contains the public key and identity information.',
    commands: [
      {
        title: 'Generate Key and CSR Together',
        command: 'openssl req -newkey rsa:2048 -keyout private.key -out request.csr -subj "/C=US/ST=State/L=City/O=Organization/CN=example.com"',
        description: 'Generate a new private key and CSR in one command'
      },
      {
        title: 'Create CSR from Existing Key',
        command: 'openssl req -new -key private.key -out request.csr',
        description: 'Create a CSR using an existing private key (interactive)'
      },
      {
        title: 'Create CSR with Config File',
        command: 'openssl req -new -key private.key -out request.csr -config openssl.cnf',
        description: 'Create a CSR using a configuration file for complex settings'
      },
      {
        title: 'View CSR Contents',
        command: 'openssl req -in request.csr -text -noout',
        description: 'Display the full details of a CSR'
      },
      {
        title: 'Verify CSR Signature',
        command: 'openssl req -in request.csr -verify -noout',
        description: 'Verify that the CSR is properly signed with its private key'
      },
      {
        title: 'View CSR Subject',
        command: 'openssl req -in request.csr -subject -noout',
        description: 'Display only the subject of a CSR'
      },
      {
        title: 'Create CSR with SANs',
        command: 'openssl req -new -key private.key -out request.csr -subj "/CN=example.com" -addext "subjectAltName=DNS:example.com,DNS:www.example.com"',
        description: 'Create a CSR with Subject Alternative Names'
      }
    ]
  },
  {
    id: 'crl',
    label: 'CRL',
    category: 'revocation',
    description: 'Certificate Revocation List - a list of certificates that have been revoked by the CA before their expiration date.',
    commands: [
      {
        title: 'Create Empty CRL',
        command: 'openssl ca -gencrl -keyfile ca.key -cert ca.crt -out crl.pem -config openssl.cnf',
        description: 'Generate an empty CRL using the CA configuration'
      },
      {
        title: 'Revoke a Certificate',
        command: 'openssl ca -revoke cert.crt -keyfile ca.key -cert ca.crt -config openssl.cnf',
        description: 'Revoke a certificate (updates the CA database)'
      },
      {
        title: 'Update CRL After Revocation',
        command: 'openssl ca -gencrl -keyfile ca.key -cert ca.crt -out crl.pem -config openssl.cnf',
        description: 'Regenerate the CRL after revoking certificates'
      },
      {
        title: 'View CRL Contents',
        command: 'openssl crl -in crl.pem -text -noout',
        description: 'Display the full details of a CRL'
      },
      {
        title: 'Convert CRL to DER Format',
        command: 'openssl crl -in crl.pem -outform DER -out crl.der',
        description: 'Convert CRL from PEM to DER format'
      },
      {
        title: 'Verify CRL Signature',
        command: 'openssl crl -in crl.pem -CAfile ca.crt -verify -noout',
        description: 'Verify the CRL is properly signed by the CA'
      },
      {
        title: 'Check Certificate Against CRL',
        command: 'openssl verify -crl_check -CAfile ca.crt -CRLfile crl.pem cert.crt',
        description: 'Verify a certificate checking for revocation via CRL'
      },
      {
        title: 'Download CRL from URL',
        command: 'curl -o crl.der http://example.com/crl.der && openssl crl -in crl.der -inform DER -out crl.pem',
        description: 'Download a CRL from a distribution point and convert to PEM'
      }
    ]
  },
  {
    id: 'ocsp',
    label: 'OCSP Responder',
    category: 'revocation',
    description: 'Online Certificate Status Protocol - provides real-time certificate status checking as an alternative to CRLs.',
    commands: [
      {
        title: 'Query OCSP Status',
        command: 'openssl ocsp -issuer ca.crt -cert server.crt -url http://ocsp.example.com -resp_text',
        description: 'Check certificate status via OCSP responder'
      },
      {
        title: 'Query OCSP with CA Chain',
        command: 'openssl ocsp -issuer intermediate-ca.crt -cert server.crt -CAfile ca-chain.crt -url http://ocsp.example.com',
        description: 'Query OCSP with full CA chain verification'
      },
      {
        title: 'Extract OCSP URL from Certificate',
        command: 'openssl x509 -in cert.crt -noout -ocsp_uri',
        description: 'Extract the OCSP responder URL from a certificate'
      },
      {
        title: 'Start OCSP Responder (Test)',
        command: 'openssl ocsp -index index.txt -port 8080 -rsigner ocsp.crt -rkey ocsp.key -CA ca.crt -text',
        description: 'Start a simple OCSP responder for testing'
      },
      {
        title: 'Create OCSP Request',
        command: 'openssl ocsp -issuer ca.crt -cert server.crt -reqout ocsp-request.der',
        description: 'Create an OCSP request file without sending it'
      },
      {
        title: 'Parse OCSP Response',
        command: 'openssl ocsp -respin ocsp-response.der -text',
        description: 'Parse and display an OCSP response file'
      },
      {
        title: 'OCSP Stapling Test',
        command: 'openssl s_client -connect server:443 -status -servername server',
        description: 'Test if a server supports OCSP stapling'
      }
    ]
  },
  {
    id: 'trust-store',
    label: 'Trust Store',
    category: 'store',
    description: 'A collection of trusted CA certificates. Systems use trust stores to validate certificate chains.',
    commands: [
      {
        title: 'List System Trust Store (macOS)',
        command: 'security find-certificate -a -p /System/Library/Keychains/SystemRootCertificates.keychain',
        description: 'List all certificates in the macOS system trust store'
      },
      {
        title: 'List System Trust Store (Linux)',
        command: 'ls -la /etc/ssl/certs/',
        description: 'List certificates in the Linux system trust store'
      },
      {
        title: 'Create Custom Trust Store',
        command: 'cat ca1.crt ca2.crt ca3.crt > custom-trust-store.pem',
        description: 'Create a custom trust store by concatenating CA certificates'
      },
      {
        title: 'Verify Against Custom Trust Store',
        command: 'openssl verify -CAfile custom-trust-store.pem server.crt',
        description: 'Verify a certificate against a custom trust store'
      },
      {
        title: 'Create PKCS#12 Trust Store',
        command: 'openssl pkcs12 -export -nokeys -in ca.crt -out truststore.p12',
        description: 'Create a PKCS#12 trust store file'
      },
      {
        title: 'Update CA Bundle (Ubuntu)',
        command: 'sudo update-ca-certificates',
        description: 'Update the system CA bundle on Ubuntu/Debian'
      },
      {
        title: 'Add CA to Trust Store (Ubuntu)',
        command: 'sudo cp ca.crt /usr/local/share/ca-certificates/ && sudo update-ca-certificates',
        description: 'Add a CA certificate to the system trust store on Ubuntu'
      },
      {
        title: 'View Trust Store Contents',
        command: 'openssl crl2pkcs7 -nocrl -certfile ca-bundle.crt | openssl pkcs7 -print_certs -noout',
        description: 'List all certificates in a CA bundle file'
      }
    ]
  },
  {
    id: 'cert-chain',
    label: 'Certificate Chain',
    category: 'chain',
    description: 'The complete chain of certificates from an end-entity certificate up to the root CA.',
    commands: [
      {
        title: 'Create Certificate Chain File',
        command: 'cat server.crt intermediate-ca.crt root-ca.crt > fullchain.pem',
        description: 'Create a full certificate chain file (leaf first, root last)'
      },
      {
        title: 'Verify Certificate Chain',
        command: 'openssl verify -CAfile root-ca.crt -untrusted intermediate-ca.crt server.crt',
        description: 'Verify a certificate chain with untrusted intermediates'
      },
      {
        title: 'View Certificates in Chain',
        command: 'openssl crl2pkcs7 -nocrl -certfile fullchain.pem | openssl pkcs7 -print_certs -text -noout',
        description: 'Display details of all certificates in a chain file'
      },
      {
        title: 'Split Chain into Individual Certs',
        command: 'csplit -f cert- fullchain.pem \'/-----BEGIN CERTIFICATE-----/\' \'{*}\'',
        description: 'Split a certificate chain into individual certificate files'
      },
      {
        title: 'Get Chain from Server',
        command: 'openssl s_client -connect server:443 -showcerts </dev/null 2>/dev/null | sed -n \'/BEGIN/,/END/p\'',
        description: 'Download the certificate chain from a TLS server'
      },
      {
        title: 'Verify Chain Order',
        command: 'openssl verify -partial_chain -CAfile fullchain.pem server.crt',
        description: 'Verify that certificates in a chain are in correct order'
      },
      {
        title: 'Check Chain Completeness',
        command: 'openssl s_client -connect server:443 -servername server 2>/dev/null | grep -i verify',
        description: 'Check if a server provides a complete certificate chain'
      }
    ]
  }
];

export const categoryColors = {
  ca: '#e74c3c',
  cert: '#3498db',
  key: '#2ecc71',
  request: '#f39c12',
  revocation: '#9b59b6',
  store: '#1abc9c',
  chain: '#34495e'
};

export const categoryLabels = {
  ca: 'Certificate Authority',
  cert: 'Certificate',
  key: 'Key',
  request: 'Request',
  revocation: 'Revocation',
  store: 'Trust Store',
  chain: 'Chain'
};
