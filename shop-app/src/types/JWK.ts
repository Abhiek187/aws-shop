type JWK = {
  keys: {
    kid: string; // key ID
    alg: string; // algorithm
    kty: string; // key type
    e: string; // RSA public exponent
    n: string; // RSA modulus
    use: string; // public key use ((sig)nature or (enc)ryption)
  }[];
};

export default JWK;
