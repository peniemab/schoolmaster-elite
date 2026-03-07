import { Client, Databases, Account, Teams, ID } from 'appwrite';
const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!);


    export const account = new Account(client);
export const databases = new Databases(client);
export { client };
// export const teams = new Teams(client); // gestion des rôles (Directeur vs Secrétaire)
export { ID };

