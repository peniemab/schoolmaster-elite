import { Client, Account, Databases, Teams } from 'appwrite';

const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1') 
    .setProject('69a461c7001ae5256c62'); 

export const account = new Account(client);
export const databases = new Databases(client);
export const teams = new Teams(client); // gestion des rôles (Directeur vs Secrétaire)