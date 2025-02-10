import { createThirdwebClient } from "thirdweb";

// Replace this with your client ID string
// refer to https://portal.thirdweb.com/typescript/v5/client on how to get a client ID
// const clientId = import.meta.env.VITE_TEMPLATE_CLIENT_ID;
const clientId = "d1ecd002021674b8767c34505f4bb3b8";

export const client = createThirdwebClient({
  clientId: clientId,
});
