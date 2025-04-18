import { z } from "zod";
import { divisi } from "./userSchema.js";

const jsonSchema = z.record(z.string()).refine((data)=>{
  try{
    JSON.stringify(data);
    return true
  }catch(error){
    return false
  }
}, "data harus JSON Valid")

export const addCandidatesSchema = z.object({
  name: z.string().nonempty("Nama tidak boleh kosong"),
  vision: jsonSchema,
  mission: jsonSchema,
  divisi: divisi,
});