export const pkiLinks = [
  // CA Hierarchy
  {
    source: 'root-ca',
    target: 'intermediate-ca',
    label: 'signs',
    description: 'Root CA signs the intermediate CA certificate'
  },

  // Intermediate CA issues certificates
  {
    source: 'intermediate-ca',
    target: 'server-cert',
    label: 'issues',
    description: 'Intermediate CA issues server certificates'
  },
  {
    source: 'intermediate-ca',
    target: 'client-cert',
    label: 'issues',
    description: 'Intermediate CA issues client certificates'
  },

  // Key relationships
  {
    source: 'private-key',
    target: 'public-key',
    label: 'derives',
    description: 'Public key is mathematically derived from private key'
  },
  {
    source: 'private-key',
    target: 'csr',
    label: 'generates',
    description: 'Private key is used to generate and sign a CSR'
  },

  // CSR to Certificate flow
  {
    source: 'csr',
    target: 'intermediate-ca',
    label: 'submitted to',
    description: 'CSR is submitted to CA for signing'
  },

  // Certificate contains public key
  {
    source: 'server-cert',
    target: 'public-key',
    label: 'contains',
    description: 'Server certificate contains the public key'
  },
  {
    source: 'client-cert',
    target: 'public-key',
    label: 'contains',
    description: 'Client certificate contains the public key'
  },

  // Revocation mechanisms
  {
    source: 'intermediate-ca',
    target: 'crl',
    label: 'publishes',
    description: 'CA publishes CRL with revoked certificates'
  },
  {
    source: 'intermediate-ca',
    target: 'ocsp',
    label: 'operates',
    description: 'CA operates OCSP responder for real-time status'
  },
  {
    source: 'crl',
    target: 'server-cert',
    label: 'may revoke',
    description: 'CRL may contain revoked server certificates'
  },
  {
    source: 'ocsp',
    target: 'server-cert',
    label: 'checks status',
    description: 'OCSP provides real-time status for certificates'
  },

  // Trust Store
  {
    source: 'trust-store',
    target: 'root-ca',
    label: 'contains',
    description: 'Trust store contains trusted root CA certificates'
  },

  // Certificate Chain
  {
    source: 'cert-chain',
    target: 'server-cert',
    label: 'includes',
    description: 'Certificate chain starts with the end-entity certificate'
  },
  {
    source: 'cert-chain',
    target: 'intermediate-ca',
    label: 'includes',
    description: 'Certificate chain includes intermediate CA'
  },
  {
    source: 'cert-chain',
    target: 'root-ca',
    label: 'terminates at',
    description: 'Certificate chain terminates at the root CA'
  }
];
