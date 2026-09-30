import { Client, Account, Databases } from 'appwrite';
import { appwriteConfig } from './config';

export const client = new Client();

if (appwriteConfig.endpoint) {
  client.setEndpoint(appwriteConfig.endpoint);
}

if (appwriteConfig.projectId) {
  client.setProject(appwriteConfig.projectId);
}

export const account = new Account(client);
export const databases = new Databases(client);
