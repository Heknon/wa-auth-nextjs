import { DefaultSession } from "next-auth";
import { User } from "@prisma/client";

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        user?: {
            id: string;
            phone: string;
        } & DefaultSession["user"];
    }

    interface User extends UserPrisma {}

    interface JWT {
        id: string;
        phone: string;
    }
}
