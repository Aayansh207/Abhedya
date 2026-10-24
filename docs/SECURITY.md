# Security Notes

- Use a maintained library for password-based key derivation and authenticated encryption.
- Derive separate encryption and embedding keys with appropriate domain separation.
- Generate salts/nonces using a cryptographically secure random source and follow the library's requirements.
- Return plaintext only after authentication succeeds.
- Wrong password, absent payload, malformed payload, and failed authentication should produce one generic user-facing failure.
- Never log passwords, derived keys, or plaintext.
- Validate image dimensions and payload lengths before large allocations.
- PNG is lossless, but sharing services may resize/recompress images. Do not promise arbitrary-channel survival.
- Key-seeded scattering is not a guarantee against steganalysis. Measure results.
