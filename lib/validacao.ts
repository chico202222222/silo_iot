import { z } from "zod";

// regras do formulario de login, o zod confere antes de mandar pro backend
// o limite de 72 é pq o bcrypt do backend nao aceita senha maior que isso

// zod = melhor lib de validacao de dados ..
// fonte: https://zod.dev/basics
// fonte: https://stackoverflow.com/questions/75883100/how-to-make-a-custom-error-message-in-zod
export const esquemaLogin = z.object({
    email: z.email("E-mail inválido."),
    senha: z.string().min(8, "Senha deve ter pelo menos 8 caracteres.").max(72, "Senha muito longa."),
});
