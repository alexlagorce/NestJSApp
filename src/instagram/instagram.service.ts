import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '@nestjs/config';
import qs from 'qs'; // Utilisez qs pour convertir l'objet en chaîne de requête

@Injectable()
export class InstagramService {
    private readonly apiUrl: string;
    private readonly accessToken: string;
    private readonly clientId: string;
    private readonly clientSecret: string;

    constructor(private configService: ConfigService) {
        this.apiUrl = this.configService.get<string>('INSTAGRAM_API_URL');
        this.accessToken = this.configService.get<string>('INSTAGRAM_ACCESS_TOKEN');
        this.clientId = this.configService.get<string>('INSTAGRAM_CLIENT_ID');
        this.clientSecret = this.configService.get<string>('INSTAGRAM_CLIENT_SECRET');
      }
        
      async exchangeCodeForToken(code: string) {
        try {
            const redirectUri = 'https://nestjsapp.onrender.com/instagram/callback';
    
            const formData = new FormData();
            formData.append('client_id', this.clientId);
            formData.append('client_secret', this.clientSecret);
            formData.append('grant_type', 'authorization_code');
            formData.append('redirect_uri', redirectUri);
            formData.append('code', code);
    
            const response = await axios.post(
                'https://api.instagram.com/oauth/access_token',
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } } // Ajout automatique des en-têtes pour FormData
            );
    
            console.log('Réponse de la requête POST:', response.data);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'échange de code pour le token:', error.response?.data || error.message);
            throw new Error('Erreur lors de l\'échange de code pour le token.');
        }
    }

    async getUserProfile(userId: string, accessToken: string) {
        try {
          const response = await axios.get(`${this.apiUrl}/${userId}`, {
            params: {
              fields: 'id,username,account_type',
              access_token: accessToken,
            },
          });
          return response.data;
        } catch (error) {
          console.error('Error fetching Instagram user profile:', error.response?.data || error.message);
          throw new Error('Failed to fetch user profile.');
        }
      }

}