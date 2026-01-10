// Simplified flows for beginners to understand PKI step by step

export const beginnerFlows = [
  {
    id: 'cert-issuance',
    name: 'Cert Issuance',
    description: 'How a server gets its certificate',
    nodes: [
      { id: 'step1', label: '1. Key', fullId: 'private-key' },
      { id: 'step2', label: '2. CSR', fullId: 'csr' },
      { id: 'step3', label: '3. CA', fullId: 'intermediate-ca' },
      { id: 'step4', label: '4. Cert', fullId: 'server-cert' }
    ],
    links: [
      { source: 'step1', target: 'step2', label: 'generates' },
      { source: 'step2', target: 'step3', label: 'submit' },
      { source: 'step3', target: 'step4', label: 'issues' }
    ]
  },
  {
    id: 'trust-chain',
    name: 'Trust Chain',
    description: 'How certificate trust is established',
    nodes: [
      { id: 'step1', label: '1. Root CA', fullId: 'root-ca' },
      { id: 'step2', label: '2. Sub CA', fullId: 'intermediate-ca' },
      { id: 'step3', label: '3. Server', fullId: 'server-cert' },
      { id: 'step4', label: '4. Trusted', fullId: 'trust-store' }
    ],
    links: [
      { source: 'step1', target: 'step2', label: 'signs' },
      { source: 'step2', target: 'step3', label: 'signs' },
      { source: 'step4', target: 'step1', label: 'trusts' }
    ]
  },
  {
    id: 'revocation',
    name: 'Revocation',
    description: 'How certificates are revoked and checked',
    nodes: [
      { id: 'step1', label: '1. CA', fullId: 'intermediate-ca' },
      { id: 'step2', label: '2. CRL', fullId: 'crl' },
      { id: 'step3', label: '3. OCSP', fullId: 'ocsp' },
      { id: 'step4', label: '4. Cert', fullId: 'server-cert' }
    ],
    links: [
      { source: 'step1', target: 'step2', label: 'publishes' },
      { source: 'step1', target: 'step3', label: 'operates' },
      { source: 'step2', target: 'step4', label: 'revokes' },
      { source: 'step3', target: 'step4', label: 'checks' }
    ]
  },
  {
    id: 'mtls',
    name: 'mTLS',
    description: 'Mutual TLS - both client and server authenticate',
    nodes: [
      { id: 'step1', label: '1. Server', fullId: 'server-cert' },
      { id: 'step2', label: '2. Client', fullId: 'client-cert' },
      { id: 'step3', label: '3. Verify', fullId: 'cert-chain' },
      { id: 'step4', label: '4. Trust', fullId: 'trust-store' }
    ],
    links: [
      { source: 'step1', target: 'step3', label: 'presents' },
      { source: 'step2', target: 'step3', label: 'presents' },
      { source: 'step3', target: 'step4', label: 'validates' }
    ]
  },
  {
    id: 'renewal',
    name: 'Renewal',
    description: 'How to renew an expiring certificate',
    nodes: [
      { id: 'step1', label: '1. Old Cert', fullId: 'server-cert' },
      { id: 'step2', label: '2. New CSR', fullId: 'csr' },
      { id: 'step3', label: '3. CA', fullId: 'intermediate-ca' },
      { id: 'step4', label: '4. New Cert', fullId: 'server-cert' }
    ],
    links: [
      { source: 'step1', target: 'step2', label: 'expiring' },
      { source: 'step2', target: 'step3', label: 'submit' },
      { source: 'step3', target: 'step4', label: 'issues' }
    ]
  },
  {
    id: 'format-conversion',
    name: 'Formats',
    description: 'Converting between certificate formats',
    nodes: [
      { id: 'step1', label: '1. PEM', fullId: 'server-cert' },
      { id: 'step2', label: '2. DER', fullId: 'server-cert' },
      { id: 'step3', label: '3. PKCS12', fullId: 'client-cert' }
    ],
    links: [
      { source: 'step1', target: 'step2', label: 'convert' },
      { source: 'step1', target: 'step3', label: 'bundle' },
      { source: 'step2', target: 'step1', label: 'convert' }
    ]
  },
  {
    id: 'key-pair',
    name: 'Key Pairs',
    description: 'How public and private keys relate',
    nodes: [
      { id: 'step1', label: '1. Private', fullId: 'private-key' },
      { id: 'step2', label: '2. Public', fullId: 'public-key' },
      { id: 'step3', label: '3. Cert', fullId: 'server-cert' }
    ],
    links: [
      { source: 'step1', target: 'step2', label: 'derives' },
      { source: 'step2', target: 'step3', label: 'embedded' }
    ]
  }
];

export const flowColors = {
  'cert-issuance': '#3498db',
  'trust-chain': '#e74c3c',
  'revocation': '#9b59b6',
  'key-pair': '#2ecc71',
  'mtls': '#e67e22',
  'renewal': '#1abc9c',
  'format-conversion': '#34495e'
};
