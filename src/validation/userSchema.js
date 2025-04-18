import { z } from "zod";

export const divisi = z.enum(["Web Development", "ITNSA", "Cyber Security", "AI"], {
  errorMap: () => ({ message: "Divisi tidak valid!" }),
});


export const role = z.enum(["USER", "ADMIN"], {
  errorMap: () => ({ message: "Role tidak valid" }),
});

export const registerSchema = z.object({
  name: z.string().min(1, "Username harus diisi").max(255, "Username terlalu panjang"),
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password Minimal 6 karakter").max(255, "Password terlalu panjang"),
  divisi: divisi,
  role:role
})

export const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password Minimal 6 karakter").max(255, "Password terlalu panjang")
})