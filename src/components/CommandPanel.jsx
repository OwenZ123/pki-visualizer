import { useState } from 'react';
import { categoryColors, categoryLabels } from '../data/pkiNodes';

// Syntax highlighting for OpenSSL commands
function highlightCommand(command) {
  // Split into tokens while preserving spaces
  const parts = [];
  let current = '';
  let inQuote = false;
  let quoteChar = '';

  for (let i = 0; i < command.length; i++) {
    const char = command[i];

    if ((char === '"' || char === "'") && !inQuote) {
      if (current) parts.push({ type: 'text', value: current });
      current = char;
      inQuote = true;
      quoteChar = char;
    } else if (char === quoteChar && inQuote) {
      current += char;
      parts.push({ type: 'string', value: current });
      current = '';
      inQuote = false;
      quoteChar = '';
    } else if (char === ' ' && !inQuote) {
      if (current) parts.push({ type: 'text', value: current });
      parts.push({ type: 'space', value: ' ' });
      current = '';
    } else {
      current += char;
    }
  }
  if (current) parts.push({ type: 'text', value: current });

  // Classify tokens
  return parts.map((part, i) => {
    if (part.type === 'space') return <span key={i}> </span>;
    if (part.type === 'string') return <span key={i} className="hl-string">{part.value}</span>;

    const val = part.value;

    // Commands
    if (i === 0 || (parts[i-1]?.value === '|' || parts[i-1]?.value === '&&')) {
      if (['openssl', 'cat', 'curl', 'diff', 'csplit', 'ssh-keygen', 'security', 'sudo', 'ls'].includes(val)) {
        return <span key={i} className="hl-command">{val}</span>;
      }
    }

    // OpenSSL subcommands
    if (['genrsa', 'req', 'x509', 'rsa', 'ec', 'ecparam', 'pkcs12', 'crl', 'ocsp', 'verify', 's_client', 'ca', 'crl2pkcs7', 'pkcs7', 'dgst'].includes(val)) {
      return <span key={i} className="hl-subcommand">{val}</span>;
    }

    // Flags
    if (val.startsWith('-')) {
      return <span key={i} className="hl-flag">{val}</span>;
    }

    // File extensions
    if (/\.(pem|crt|key|csr|der|p12|pfx|pub|cnf)$/.test(val)) {
      return <span key={i} className="hl-file">{val}</span>;
    }

    // Numbers
    if (/^\d+$/.test(val)) {
      return <span key={i} className="hl-number">{val}</span>;
    }

    // Operators
    if (['|', '>', '<', '&&', '||', '$(', ')'].includes(val)) {
      return <span key={i} className="hl-operator">{val}</span>;
    }

    return <span key={i}>{val}</span>;
  });
}

// Example outputs for common commands
const commandOutputs = {
  'openssl x509 -in': `Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1234567890 (0x499602d2)
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=US, ST=State, O=Org, CN=Intermediate CA
        Validity
            Not Before: Jan  1 00:00:00 2024 GMT
            Not After : Jan  1 00:00:00 2025 GMT
        Subject: C=US, ST=State, O=Org, CN=example.com`,

  'openssl req -in': `Certificate Request:
    Data:
        Version: 1 (0x0)
        Subject: C=US, ST=State, L=City, O=Org, CN=example.com
        Subject Public Key Info:
            Public Key Algorithm: rsaEncryption
                RSA Public-Key: (2048 bit)`,

  'openssl rsa -in': `RSA Private-Key: (2048 bit, 2 primes)
modulus:
    00:b5:8f:9d:...
publicExponent: 65537 (0x10001)
privateExponent:
    00:8c:2e:f1:...`,

  'openssl verify': `server.crt: OK`,

  'openssl s_client': `CONNECTED(00000003)
depth=2 C=US, O=Org, CN=Root CA
verify return:1
depth=1 C=US, O=Org, CN=Intermediate CA
verify return:1
depth=0 C=US, O=Org, CN=example.com
verify return:1
---
Certificate chain
 0 s:CN=example.com
   i:CN=Intermediate CA`,

  'openssl genrsa': `Generating RSA private key, 2048 bit long modulus
....................+++
.......+++
e is 65537 (0x10001)`,

  'openssl crl -in': `Certificate Revocation List (CRL):
    Version 2 (0x1)
    Signature Algorithm: sha256WithRSAEncryption
    Issuer: C=US, O=Org, CN=Intermediate CA
    Last Update: Jan  1 00:00:00 2024 GMT
    Next Update: Feb  1 00:00:00 2024 GMT
Revoked Certificates:
    Serial Number: 1234
        Revocation Date: Dec 15 00:00:00 2023 GMT`,

  'openssl ocsp': `Response verify OK
server.crt: good
    This Update: Jan  1 00:00:00 2024 GMT`
};

function getExampleOutput(command) {
  for (const [key, output] of Object.entries(commandOutputs)) {
    if (command.includes(key)) {
      return output;
    }
  }
  return null;
}

export default function CommandPanel({ node, darkMode = false }) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [expandedOutput, setExpandedOutput] = useState({});

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const toggleOutput = (index) => {
    setExpandedOutput(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  if (!node) {
    return (
      <div className={`command-panel empty ${darkMode ? 'dark' : ''}`}>
        <div className="empty-state">
          <h2>PKI Component Visualizer</h2>
          <p>Click on any node in the graph to view its details and related OpenSSL commands.</p>
          <div className="legend">
            <h3>Legend</h3>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="legend-item">
                <span
                  className="legend-dot"
                  style={{ backgroundColor: categoryColors[key] }}
                />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="tips">
            <h3>Tips</h3>
            <ul>
              <li>Drag nodes to rearrange the graph</li>
              <li>Scroll to zoom in/out</li>
              <li>Try Beginner Mode for step-by-step flows</li>
              <li>Use Auto-Play for presentations</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Get the proper label - use original label if in beginner mode
  const displayLabel = node.label?.includes('.')
    ? node.label.split('. ')[1] || node.label
    : node.label;

  return (
    <div className={`command-panel ${darkMode ? 'dark' : ''}`}>
      <div className="node-header">
        {node.category && (
          <span
            className="category-badge"
            style={{ backgroundColor: categoryColors[node.category] }}
          >
            {categoryLabels[node.category]}
          </span>
        )}
        <h2>{displayLabel}</h2>
      </div>

      {node.description && (
        <p className="node-description">{node.description}</p>
      )}

      {node.commands && node.commands.length > 0 && (
        <div className="commands-section">
          <h3>OpenSSL Commands</h3>
          <div className="commands-list">
            {node.commands.map((cmd, index) => {
              const exampleOutput = getExampleOutput(cmd.command);
              const isExpanded = expandedOutput[index];

              return (
                <div key={index} className="command-item">
                  <div className="command-header">
                    <h4>{cmd.title}</h4>
                    <div className="command-actions">
                      {exampleOutput && (
                        <button
                          className={`output-btn ${isExpanded ? 'active' : ''}`}
                          onClick={() => toggleOutput(index)}
                          title="Show example output"
                        >
                          {isExpanded ? 'Hide Output' : 'Show Output'}
                        </button>
                      )}
                      <button
                        className={`copy-btn ${copiedIndex === index ? 'copied' : ''}`}
                        onClick={() => copyToClipboard(cmd.command, index)}
                      >
                        {copiedIndex === index ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                  <p className="command-description">{cmd.description}</p>
                  <pre className="command-code">
                    <code>{highlightCommand(cmd.command)}</code>
                  </pre>
                  {isExpanded && exampleOutput && (
                    <div className="command-output">
                      <div className="output-header">Example Output:</div>
                      <pre className="output-code">
                        <code>{exampleOutput}</code>
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
