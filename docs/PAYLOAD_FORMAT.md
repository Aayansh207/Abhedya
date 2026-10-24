# Payload Format — To Be Finalized

**Do not implement competing formats independently. Member 1 and Member 2 must agree on this document before integrating the UI and core.**

Proposed conceptual fields:

1. Magic signature
2. Format version
3. Mode/flags
4. Payload length
5. Password-KDF salt
6. Encryption nonce
7. Ciphertext
8. Authentication tag, if not appended by the chosen library

The exact field sizes, byte order, maximum lengths, and encoding must be specified here. Never store the password or plaintext message in the header.

Capacity estimation must use this exact format and the actual embedding algorithm.
