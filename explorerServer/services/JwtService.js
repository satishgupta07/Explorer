import jwt from "jsonwebtoken";

class JwtService {
  static sign(payload, expiry = "60s", secret = process.env.JWT_SECRET) {
    return jwt.sign(payload, secret, { expiresIn: expiry });
  }

  static verify(token, secret = process.env.JWT_SECRET) {
    return jwt.verify(token, secret);
  }
}

export default JwtService;
