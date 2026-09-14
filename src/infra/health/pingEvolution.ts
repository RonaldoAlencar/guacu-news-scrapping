import axios from "axios";
import { AppConfig } from "../config/env";

type ConnectionState = {
  instance?: {
    state?: string;
  };
  state?: string;
};

export async function pingEvolution(config: AppConfig["whatsapp"], timeoutMs = 5000): Promise<boolean> {
  const response = await axios.get<ConnectionState>(
    `${config.apiUrl}/instance/connectionState/${config.instanceName}`,
    {
      timeout: timeoutMs,
      headers: { apikey: config.apiKey },
      validateStatus: (status) => status < 500,
    },
  );
  if (response.status >= 400) {
    return false;
  }
  const state = response.data.instance?.state ?? response.data.state ?? "";
  return state.toLowerCase() === "open";
}
