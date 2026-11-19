import { getRequestConfig } from "next-intl/server";
import enInMessages from "../../messages/en-IN.json";

export default getRequestConfig(async () => {
  const locale = "en-IN";

  return {
    locale,
    messages: enInMessages,
  };
});
