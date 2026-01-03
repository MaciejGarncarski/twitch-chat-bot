import { env } from "@/config/env"
import { JWTOption } from "@elysiajs/jwt"

export const jwtConfig: JWTOption = {
  name: "jwt",
  secret: env.JWT_SECRET,
  exp: "7d",
}
