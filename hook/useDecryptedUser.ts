import { User } from "@/types/type";
import { useEffect, useState } from "react";
import { decrypt } from "@/utils/sessionEncryption";

export function useDecryptedUserHook(encryptedUser: User | string | null): User | null {
  const [decryptedUser, setDecryptedUser] = useState<User | null>(null);

  useEffect(() => {
    if (typeof encryptedUser === "string") {
      const fetchDecryptedUser = async () => {
        try {
          const decryptedData = await decrypt(encryptedUser);
          setDecryptedUser(JSON.parse(decryptedData) as User);
        } catch (error) {
          console.error("Failed to decrypt user:", error);
          setDecryptedUser(null);
        }
      };

      fetchDecryptedUser();
    } else {
      setDecryptedUser(encryptedUser);
    }
  }, [encryptedUser]);

  return decryptedUser;
}
