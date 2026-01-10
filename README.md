# PKI Visualizer

An interactive web application for learning Public Key Infrastructure (PKI) concepts through visual exploration and hands-on OpenSSL commands.

**[Live Demo](https://owenz123.github.io/pki-visualizer/)**

![PKI Visualizer](screenshots/full-view.png)

## Features

### Interactive Force-Directed Graph
- Explore 11 PKI components and their relationships
- Drag nodes to rearrange, scroll to zoom
- Click any component to view details and OpenSSL commands

### Beginner Mode with 7 Tutorial Flows
| Flow | Description |
|------|-------------|
| Cert Issuance | Key → CSR → CA → Certificate |
| Trust Chain | Root CA → Intermediate → Server (vertical layout) |
| Revocation | CA → CRL/OCSP → Certificate check (branching layout) |
| mTLS | Server + Client → Verify → Trust |
| Renewal | Old Cert → New CSR → CA → New Cert |
| Formats | PEM ↔ DER ↔ PKCS12 conversions |
| Key Pairs | Private → Public → Certificate |

### Auto-Play Animation
- Step-by-step animated walkthrough
- Visual highlighting with progress indicator
- Completed steps show checkmarks
- Perfect for presentations

### OpenSSL Commands with Syntax Highlighting
- **Blue**: Commands (`openssl`)
- **Teal**: Subcommands (`x509`, `req`, `genrsa`)
- **Orange**: Flags (`-in`, `-out`, `-days`)
- **Yellow**: Files (`server.crt`, `private.key`)
- **Green**: Numbers (`2048`, `4096`)

### Example Command Outputs
Click "Show Output" to see what each command returns - great for learning what to expect.

### Dark Mode
Toggle 🌙 for a dark theme optimized for terminal users.

## PKI Components

| Component | Category | Description |
|-----------|----------|-------------|
| Root CA | CA | Self-signed trust anchor |
| Intermediate CA | CA | Subordinate CA for issuing certs |
| Server Certificate | Certificate | TLS/SSL server identity |
| Client Certificate | Certificate | mTLS client authentication |
| Private Key | Key | Secret key for signing/decryption |
| Public Key | Key | Shareable key for encryption/verification |
| CSR | Request | Certificate Signing Request |
| CRL | Revocation | Certificate Revocation List |
| OCSP Responder | Revocation | Online status checking |
| Trust Store | Store | Collection of trusted CAs |
| Certificate Chain | Chain | Full path to root CA |

## Quick Start

```bash
# Clone
git clone https://github.com/OwenZ123/pki-visualizer.git
cd pki-visualizer

# Install
npm install

# Run
npm run dev
```

Open http://localhost:5173

## Tech Stack

- **React 18** + **Vite 5**
- **react-force-graph-2d** (D3-based visualization)
- **GitHub Pages** (hosting)

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

## Contributing

Contributions welcome! Feel free to open issues or submit PRs.

## License

MIT
