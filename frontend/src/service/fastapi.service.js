import { FASTAPI_ENDPOINTS } from "@/constants/fastapi.constant";
import METHOD from "@/constants/http-method.constant";

export const fastapiPermitAnnotations = async () => {
  const res = await fetch(FASTAPI_ENDPOINTS.FASTAPI_PERMIT_ANNOTATIONS, {
    method: METHOD.GET,
  });

  const data = await res.json();
  
  return data;
}