export interface JWTPayload {
  userId: string
  email: string
  role: string
  exp: number
}

export interface ActivationToken {
  token: string
  userId: string
  email: string
  expiresAt: Date
  used: boolean
}

// Simulação do bcrypt para demonstração
export const hashPassword = async (password: string): Promise<string> => {
  // Em produção, usar bcrypt real
  return `hashed_${password}_${Date.now()}`
}

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  // Em produção, usar bcrypt.compare
  return hash.startsWith(`hashed_${password}`)
}

// Simulação do JWT para demonstração
export const generateJWT = (payload: Omit<JWTPayload, "exp">): string => {
  const exp = Date.now() + 24 * 60 * 60 * 1000 // 24 horas
  const fullPayload = { ...payload, exp }
  // Em produção, usar jsonwebtoken
  return `jwt_${btoa(JSON.stringify(fullPayload))}`
}

export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    if (!token.startsWith("jwt_")) return null
    const payload = JSON.parse(atob(token.substring(4)))
    if (payload.exp < Date.now()) return null
    return payload
  } catch {
    return null
  }
}

// Geração de token de ativação
export const generateActivationToken = (): string => {
  return `act_${Math.random().toString(36).substring(2)}_${Date.now()}`
}

// Simulação de envio de notificação
export const sendActivationLink = async (
  email: string,
  phone: string,
  token: string,
  method: "email" | "whatsapp" = "email",
): Promise<void> => {
  const activationUrl = `${window.location.origin}/ativar-conta?token=${token}`

  if (method === "email") {
    console.log(`📧 Email enviado para ${email}:`)
    console.log(`Ative sua conta clicando no link: ${activationUrl}`)
  } else {
    console.log(`📱 WhatsApp enviado para ${phone}:`)
    console.log(`Olá! Ative sua conta no ConcreteFlow: ${activationUrl}`)
  }

  // Simular delay de envio
  await new Promise((resolve) => setTimeout(resolve, 1000))
}

export const sendPasswordResetLink = async (contact: string, method: "email" | "whatsapp"): Promise<void> => {
  const resetToken = generateActivationToken()
  const resetUrl = `${window.location.origin}/redefinir-senha?token=${resetToken}`

  if (method === "email") {
    console.log(`📧 Email de recuperação enviado para ${contact}:`)
    console.log(`Redefina sua senha: ${resetUrl}`)
  } else {
    console.log(`📱 WhatsApp de recuperação enviado para ${contact}:`)
    console.log(`Redefina sua senha no ConcreteFlow: ${resetUrl}`)
  }

  await new Promise((resolve) => setTimeout(resolve, 1000))
}
